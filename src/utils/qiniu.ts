import path from 'path';

import { getRandomString } from 'billd-utils';
import { existsSync, outputFileSync, removeSync } from 'fs-extra';
import qiniu from 'qiniu';

import {
  QINIU_UPLOAD_PROGRESS_TYPE,
  REDIS_PREFIX,
  STATIC_DIR,
  UPLOAD_DIR,
} from '@/constant';
import redisController from '@/controller/redis.controller';
import { IQiniuData } from '@/interface';
import { QINIU_ACCESSKEY, QINIU_SECRETKEY } from '@/secret/secret';
import { QINIU_KODO } from '@/spec-config';
import { chalkERROR } from '@/utils/chalkTip';

export interface IQiniuKey {
  prefix: string;
  hash: string;
  ext: string;
}

const qiniuConfConfig = new qiniu.conf.Config();

// @ts-ignore
qiniuConfConfig.zone = qiniu.zone.Zone_z2; // https://developer.qiniu.com/kodo/1289/nodejs#general-uptoken，qiniu.zone.Zone_z2代表华南

class QiniuUtils {
  config = qiniuConfConfig;

  /**
   * 获取七牛云accessToken
   * @returns
   */
  getAccessToken(
    url: string,
    reqMethod: string,
    reqcontentType: string,
    reqBody: any
  ) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const accessToken = qiniu.util.generateAccessTokenV2(
      mac,
      url,
      reqMethod,
      reqcontentType,
      JSON.stringify(reqBody)
    );
    // const accessToken = qiniu.util.generateAccessToken(mac, url);
    return accessToken;
  }

  /**
   * 获取七牛云cdnManager
   * @returns
   */
  getQiniuCdnManager() {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    return new qiniu.cdn.CdnManager(mac);
  }

  /**
   * @description 获取七牛云凭证
   * @param {*} expires 过期时间，单位：秒，默认600秒
   * @return {*}
   */
  getQiniuToken(data: { expires?: number; keyToOverwrite?: string }) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const options: qiniu.rs.PutPolicyOptions = {
      scope: data.keyToOverwrite
        ? `${QINIU_KODO.hssblog.bucket}:${data.keyToOverwrite}`
        : QINIU_KODO.hssblog.bucket,
      expires: data.expires || 600, // 过期时间
      // callbackUrl: '',
      returnBody:
        '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)"}',
      // callbackBody:
      //   '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)","user_id":$(x:user_id)}',
      // callbackBodyType: 'application/json',
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
  }

  /**
   * @description 复制文件副本
   * @param srcBucket 源空间名称
   * @param srcKey 源文件名称
   * @param destBucket 目标空间名称
   * @param destKey 目标文件名称
   * @return {*}
   */
  copy({
    srcBucket,
    srcKey,
    destBucket,
    destKey,
  }: {
    srcBucket: string;
    srcKey: string;
    destBucket: string;
    destKey: string;
  }) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0; // 空间对应的机房
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const options = {
      force: false, // true强制覆盖已有同名文件；false:不强制覆盖已有同名文件
    };
    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      bucketManager.copy(
        srcBucket,
        srcKey,
        destBucket,
        destKey,
        options,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            console.log('copy失败', respErr, respBody, respInfo);
            resolve({ flag: false, respErr, respBody, respInfo });
          } else if (respInfo.statusCode === 200) {
            console.log('copy成功', respBody);
            resolve({
              flag: true,
              resultUrl: `${QINIU_KODO.hssblog.url}/${destKey}`,
              respErr,
              respBody,
              respInfo,
            });
          } else {
            console.log('copy失败', respErr, respBody, respInfo);
            resolve({ flag: false, respErr, respBody, respInfo });
          }
        }
      );
    });
  }

  async upload({ prefix, hash, ext }: IQiniuKey) {
    const filename = `${hash}.${ext}`;
    const filepath = STATIC_DIR + prefix + filename;
    const key = prefix + filename;
    const { flag, respBody } = await this.getQiniuStat(
      QINIU_KODO.hssblog.bucket,
      key
    );
    if (flag) {
      const destKey = `${prefix + hash}__${getRandomString(6)}.${ext}`;
      // 理论上任何存在重名或者需要确保唯一的操作都需要查数据库
      // 这里可以while使用this.getQiniuStat(QINIU_KODO.hssblog.bucket, destKey);判断是否随机生成的key已存在
      const res = await this.copy({
        srcBucket: QINIU_KODO.hssblog.bucket,
        srcKey: key,
        destBucket: QINIU_KODO.hssblog.bucket,
        destKey,
      });
      // 这个copy方法返回的Promise类型里没有putTime，但是下面的new Promise返回的Promise类型里面有putTime，由于ts的类型兼容，这个upload方法的Promise类型里面就会包括putTime
      // 最好两者返回固定的类型，保持一致
      return {
        ...res,
        respBody: {
          ...respBody,
          key: destKey,
          bucket: QINIU_KODO.hssblog.bucket,
        },
        putTime: respBody.putTime.toString(),
      }; // copy成功返回的respBody是null，这里将getQiniuStat的respBody设置给它
    }
    const uploadToken = this.getQiniuToken({});
    const { config } = this;
    const formUploader = new qiniu.resume_up.ResumeUploader(config);
    const putExtra = new qiniu.resume_up.PutExtra();
    const logFile = path.join(UPLOAD_DIR, `${hash}.log`); // 上传文件接口接收到的文件存放的目录

    if (!existsSync(logFile)) {
      outputFileSync(logFile, '{}');
    }
    putExtra.resumeRecordFile = logFile; // 断点续传日志文件路径v1版本下载完成会自动删除该文件！但v2版本的不会自动删除！
    putExtra.version = 'v1'; // v1版本
    putExtra.partSize = 1024 * 1024 * 4; // 4m，partSize的值必须是整数，不能带小数点！v1版本大小不等超过4m，v2版本才可以自定义块大小
    putExtra.progressCallback = (uploadBytes: number, totalBytes: number) => {
      console.log('progressCallback', uploadBytes, totalBytes);
      redisController.setExVal({
        prefix: REDIS_PREFIX.fileProgress,
        key: hash,
        value: {
          type: QINIU_UPLOAD_PROGRESS_TYPE.chunkFileProgress,
          hash,
          percentage: 50 + ((uploadBytes / totalBytes) * 100) / 2,
        },
        exp: 24 * 60 * 60,
      });
    };

    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      putTime?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      try {
        formUploader.putFile(
          uploadToken,
          key, // 这个key一定要设置null，如果同一个文件但是设置了不同的key，v1版本不报错（可能v1版本源码里面没有读取这个key），但在v2版本会报错no such uploadId
          filepath,
          putExtra,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          (respErr, respBody, respInfo) => {
            if (respErr) {
              console.log('upload上传失败', respErr, respBody, respInfo);
              resolve({ flag: false, respErr, respBody, respInfo });
              return;
            }
            if (respInfo.statusCode === 200) {
              console.log('upload上传成功');
              removeSync(filepath);
              resolve({
                flag: true,
                resultUrl: `${QINIU_KODO.hssblog.url}/${key}`,
                respErr,
                respBody,
                respInfo,
                putTime: `${+new Date()}0000`,
              });
            } else {
              console.log('upload上传失败', respErr, respBody, respInfo);
              resolve({ flag: false, respErr, respBody, respInfo });
            }
          }
        );
      } catch (error) {
        console.log(chalkERROR('formUploader.putFile错误！'));
        console.log(error);
        resolve({ flag: false });
      }
    });
  }

  uploadForm({
    prefix,
    filepath,
    originalFilename,
  }: {
    prefix: string;
    filepath: string;
    originalFilename: string;
  }) {
    const uploadToken = this.getQiniuToken({});
    const { config } = this;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    const key = `${prefix}${+new Date()}__${getRandomString(
      6
    )}__${originalFilename}`;
    return new Promise<{
      flag: boolean;
      respErr?;
      respBody?;
      respInfo?;
      resultUrl?: string;
      putTime?: string;
    }>((resolve) => {
      formUploader.putFile(
        uploadToken,
        key,
        filepath,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            console.log('uploadForm上传失败', respErr, respBody, respInfo);
            resolve({ flag: false, respErr, respBody, respInfo });
            return;
          }
          if (respInfo.statusCode === 200) {
            console.log('uploadForm上传成功');
            resolve({
              flag: true,
              resultUrl: `${QINIU_KODO.hssblog.url}/${key}`,
              respErr,
              respBody,
              respInfo,
              putTime: `${+new Date()}0000`,
            });
          } else {
            console.log('uploadForm上传失败', respErr, respBody, respInfo);
            console.log({ respErr, respBody, respInfo });
            resolve({ flag: false, respErr, respBody, respInfo });
          }
        }
      );
    });
  }

  // 验证回调是否合法
  authCb(callbackAuth) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    return qiniu.util.isQiniuCallback(
      mac,
      'qiniuCallBackUrl',
      null,
      callbackAuth
    );
  }

  // 删除七牛云文件
  delete(key: IQiniuData['qiniu_key'], bucket: IQiniuData['bucket']) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0; // 空间对应的机房
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      bucketManager.delete(bucket!, key!, (respErr, respBody, respInfo) => {
        if (respInfo.statusCode === 200) {
          resolve({ flag: true, respErr, respInfo, respBody });
        } else {
          resolve({ flag: false, respErr, respInfo, respBody });
        }
      });
    });
  }

  batchGetFileInfo(fileList: any[]) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0; // 空间对应的机房
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    // 每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
    const statOperations = fileList.map((item) => {
      return qiniu.rs.statOp(item.srcBucket, item.key);
    });
    return new Promise((resolve) => {
      bucketManager.batch(statOperations, (respErr, respBody, respInfo) => {
        const obj = {
          respErr,
          respBody,
          respInfo,
        };
        if (obj.respErr) {
          console.log(obj.respErr);
          resolve({ flag: false, ...obj });
        } else if (parseInt(`${respInfo.statusCode / 100}`, 10) === 2) {
          // 200 is success, 298 is part success
          const result: any = { success: [], error: [] };
          respBody.forEach((item) => {
            if (item.code === 200) {
              result.success.push(item.data);
            } else {
              result.error.push(item.data);
            }
          });
          resolve({ flag: true, result, respBody, respInfo });
        } else {
          console.log(respInfo, respBody);
          resolve({ flag: false, ...obj });
        }
      });
    });
  }

  // 获取文件信息
  getQiniuStat(bucket, key) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      bucketManager.stat(bucket, key, (respErr, respBody, respInfo) => {
        const obj = { respErr, respBody, respInfo };
        if (respErr) {
          resolve({ flag: false, ...obj });
          return;
        }
        if (respInfo.statusCode === 200) {
          resolve({ flag: true, ...obj });
        } else {
          resolve({ flag: false, ...obj });
        }
      });
    });
  }

  // 获取七牛云文件
  getListPrefix(prop: qiniu.rs.ListPrefixOptions) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const { bucket } = QINIU_KODO.hssblog;
    const options = {
      prefix: prop.prefix, // 列举的文件前缀
      marker: prop.marker, // 上一次列举返回的位置标记，作为本次列举的起点信息
      limit: prop.limit, // 每次返回的最大列举文件数量，最大值1000
      delimiter: prop.delimiter, // 指定目录分隔符
    };
    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      bucketManager.listPrefix(
        bucket,
        options,
        (respErr, respBody, respInfo) => {
          const obj = { respErr, respBody, respInfo };
          if (respInfo.statusCode === 200) {
            resolve({ flag: true, ...obj });
          } else {
            resolve({ flag: false, ...obj });
          }
        }
      );
    });
  }

  /**
   * @description 移动或重命名文件
   * @param srcBucket 源空间名称
   * @param srcKey 源文件名称
   * @param destBucket 目标空间名称
   * @param destKey 目标文件名称
   * @return {*}
   */
  updateQiniuFile(srcBucket, srcKey, destBucket, destKey) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    const options = {
      force: false, // true强制覆盖已有同名文件；false:不强制覆盖已有同名文件
    };
    return new Promise<{
      flag: boolean;
      resultUrl?: string;
      respErr?;
      respBody?;
      respInfo?;
    }>((resolve) => {
      bucketManager.move(
        srcBucket,
        srcKey,
        destBucket,
        destKey,
        options,
        (respErr, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            resolve({ flag: true, respErr, respBody, respInfo });
          } else {
            resolve({ flag: false, respErr, respBody, respInfo });
          }
        }
      );
    });
  }
}

export default new QiniuUtils();
