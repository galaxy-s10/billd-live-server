import fs from 'fs';

import dayjs from 'dayjs';
import {
  copySync,
  ensureDirSync,
  existsSync,
  moveSync,
  readFileSync,
  readdirSync,
  remove,
  removeSync,
} from 'fs-extra';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  COMMON_HTTP_CODE,
  IS_UPLOAD_SERVER,
  LOCALHOST_URL,
  PROJECT_PORT,
  QINIU_UPLOAD_PROGRESS_TYPE,
  REDIS_PREFIX,
  STATIC_DIR,
  UPLOAD_DIR,
} from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, IQiniuData } from '@/interface';
import { CustomError } from '@/model/customError.model';
import qiniuDataService from '@/service/qiniuData.service';
import { QINIU_KODO } from '@/spec-config';
import { formatMemorySize, getLastestWeek } from '@/utils';
import { chalkWARN } from '@/utils/chalkTip';
import QiniuUtils, { IQiniuKey } from '@/utils/qiniu';
import { myaxios } from '@/utils/request';

class QiniuController {
  getToken = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const { prefix, hash, ext }: IQiniuKey = ctx.request.query;
    if (
      !QINIU_KODO['hss-backup'].prefix[prefix] &&
      !QINIU_KODO.hssblog.prefix[prefix]
    ) {
      throw new CustomError(
        '错误的prefix',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const key = `${prefix + hash}.${ext}`;
    const token = QiniuUtils.getQiniuToken({ keyToOverwrite: key });
    successHandler({
      ctx,
      data: token,
      msg: '获取七牛云token成功，有效期10分钟',
    });
    await next();
  };

  prefetchQiniu = async (urls: string[]) => {
    try {
      // https://developer.qiniu.com/fusion/1227/file-prefetching
      const reqUrl = `http://fusion.qiniuapi.com/v2/tune/prefetch`;
      const contentType = 'application/json';
      const reqBody = {
        urls,
      };
      const token = QiniuUtils.getAccessToken(
        reqUrl,
        'POST',
        contentType,
        reqBody
      );
      const res = await myaxios.post(reqUrl, reqBody, {
        headers: {
          'Content-Type': contentType,
          Authorization: token,
        },
      });
      return res;
    } catch (error) {
      console.log('prefetchQiniu失败', error);
      throw new CustomError(
        '预取失败！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
  };

  prefetch = async (ctx: ParameterizedContext, next) => {
    const { prefix } = ctx.request.body;
    const qiniuOfficialRes = await this.getQiniuListPrefix(prefix);
    const prefetch: string[][] = [];
    const list = qiniuOfficialRes.map((item) => {
      // eslint-disable-next-line
      return `${QINIU_KODO.hssblog.url}/${item.key}`;
    });
    for (let i = 0; i < list.length; i += 60) {
      prefetch.push(list.slice(i, i + 60));
    }
    const promise = prefetch.map((item) => {
      return this.prefetchQiniu(item);
    });
    const prefetchRes = await Promise.all(promise);
    console.log('prefetchRes', prefetchRes);
    successHandler({
      ctx,
      code: 1,
      data: {
        prefetchRes,
        promise,
      },
      msg: '预取成功！',
    });

    await next();
  };

  // 设置上传进度
  setUploadProgress = async ({
    prefix,
    key,
    value,
  }: {
    prefix: string;
    key: string;
    value: { type: number; hash: string; percentage: number };
  }) => {
    await redisController.setExVal({
      prefix,
      key,
      value,
      exp: 24 * 60 * 60,
    });
  };

  // 上传chunk
  uploadChunk = async (ctx: ParameterizedContext, next) => {
    const {
      prefix,
      hash,
      ext,
      chunkName,
      chunkTotal,
    }: {
      prefix: string;
      hash: string;
      ext: string;
      chunkName: string;
      chunkTotal: string;
    } = ctx.request.body;
    const key = `${prefix + hash}.${ext}`;
    if (!IS_UPLOAD_SERVER) {
      const { flag } = await QiniuUtils.getQiniuStat(
        QINIU_KODO.hssblog.bucket,
        key
      );
      if (flag) {
        successHandler({
          code: 3,
          ctx,
          msg: '文件已存在，不需要再上传chunk，请直接调用upload',
        });
        await next();
        return;
      }
    } else if (existsSync(UPLOAD_DIR + key)) {
      successHandler({
        code: 3,
        ctx,
        msg: '文件已存在，不需要再上传chunk，请直接调用upload',
      });
    }
    const { uploadFiles } = ctx.request.files!;
    if (!uploadFiles) {
      throw new CustomError(
        '请传入uploadFiles！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (Array.isArray(uploadFiles)) {
      throw new CustomError(
        'uploadFiles不能是数组！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const chunkInfo = {
      prefix,
      hash,
      filepath: uploadFiles.filepath,
      originalFilename: uploadFiles.originalFilename,
    };
    try {
      const destHashDir = UPLOAD_DIR + hash;
      const destHashChunk = `${destHashDir}/${chunkName}`;
      ensureDirSync(destHashDir);
      // 这个chunk已经存在了
      if (existsSync(destHashChunk)) {
        // 删除临时文件
        remove(chunkInfo.filepath);
        const num = readdirSync(destHashDir).length;
        const percentage = ((num / +chunkTotal) * 100) / 2;
        successHandler({
          ctx,
          code: 2,
          data: { percentage },
          msg: `${hash}/${chunkName}已存在！`,
        });
      } else {
        copySync(chunkInfo.filepath, destHashChunk);
        removeSync(chunkInfo.filepath);
        const num = readdirSync(destHashDir).length;
        const percentage = ((num / +chunkTotal) * 100) / 2;

        await this.setUploadProgress({
          prefix: REDIS_PREFIX.fileProgress,
          key: hash,
          value: {
            type: QINIU_UPLOAD_PROGRESS_TYPE.chunkFileProgress,
            hash,
            percentage,
          },
        });
        successHandler({
          ctx,
          code: 1,
          data: {
            percentage,
          },
          msg: `${hash}/${chunkName}上传成功！`,
        });
      }
      await next();
    } catch (error: any) {
      // 删除临时文件
      remove(chunkInfo.filepath);
      throw new CustomError(error?.message);
    }
  };

  // 合并chunk
  mergeChunk = async (ctx: ParameterizedContext, next) => {
    const { hash, ext, prefix }: IQiniuKey = ctx.request.body;
    if (!QINIU_KODO.hssblog.prefix[prefix]) {
      throw new CustomError(
        `prefix错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const resultPath = `${UPLOAD_DIR + hash}.${ext}`;
    const chunkDir = UPLOAD_DIR + hash;
    // 判断是否是目录
    if (fs.statSync(chunkDir).isDirectory()) {
      const bufferArr: Buffer[] = [];
      // 读取目录
      readdirSync(chunkDir)
        .sort((a: string, b: string) => +a - +b)
        .forEach((v) => {
          const buffer = Buffer.from(readFileSync(`${chunkDir}/${v}`));
          bufferArr.push(buffer);
        });
      // 将buffer数组写入到resultPath
      fs.writeFileSync(resultPath, Buffer.concat(bufferArr));
      // 删除chunk目录
      removeSync(UPLOAD_DIR + hash);
      const filename = `${hash}.${ext}`;
      moveSync(
        `${UPLOAD_DIR}${filename}`,
        `${STATIC_DIR}${prefix}${filename}`,
        { overwrite: true }
      );
      successHandler({
        ctx,
        code: 1,
        msg: '合并成功！',
      });
    } else {
      successHandler({
        ctx,
        code: 2,
        msg: `合并失败！${chunkDir}目录不存在！`,
      });
    }

    await next();
  };

  upload = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    const { hash, ext, prefix }: IQiniuKey = ctx.request.body;
    if (!QINIU_KODO.hssblog.prefix[prefix]) {
      throw new CustomError(
        `prefix错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (!IS_UPLOAD_SERVER) {
      const result = await QiniuUtils.upload({
        ext,
        prefix,
        hash,
      });
      qiniuDataService.create({
        user_id: userInfo?.id || -1,
        prefix,
        bucket: result.respBody.bucket,
        qiniu_key: result.respBody.key,
        qiniu_fsize: result.respBody.fsize,
        qiniu_hash: result.respBody.hash,
        qiniu_mimeType: result.respBody.mimeType,
        qiniu_putTime: result.putTime,
      });
      successHandler({
        ctx,
        data: result,
      });
    } else {
      const filename = `${hash}.${ext}`;
      let resultUrl = '';
      const isIp = !/[a-zA-Z]+/.test(LOCALHOST_URL);
      // @ts-ignore
      if (LOCALHOST_URL === 'localhost' || isIp) {
        resultUrl = `http://${LOCALHOST_URL}:${PROJECT_PORT}/${prefix}${filename}`;
      } else {
        resultUrl = `http://${LOCALHOST_URL as string}/${filename}`;
      }
      successHandler({
        ctx,
        data: {
          flag: true,
          resultUrl,
          putTime: `${+new Date()}0000`,
          respErr: '',
          respBody: '',
          respInfo: '',
        },
      });
    }
    await next();
  };

  // 获取所有七牛云文件
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      user_id,
      prefix,
      bucket,
      qiniu_fsize,
      qiniu_hash,
      qiniu_key,
      qiniu_md5,
      qiniu_mimeType,
      qiniu_putTime,
      qiniu_status,
      qiniu_type,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IQiniuData> = ctx.request.query;
    const result = await qiniuDataService.getList({
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      id,
      user_id,
      prefix,
      bucket,
      qiniu_fsize,
      qiniu_hash,
      qiniu_key,
      qiniu_md5,
      qiniu_mimeType,
      qiniu_putTime,
      qiniu_status,
      qiniu_type,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  // 批量获取文件信息
  async batchFileInfo(fileList: { srcBucket: string; key: string }[]) {
    const result = await QiniuUtils.batchGetFileInfo(fileList);
    return result;
  }

  // 获取文件上传进度
  getProgress = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const { prefix, hash, ext }: IQiniuKey = ctx.request.query;
    const key = `${prefix + hash}.${ext}`;
    let flag = false;
    if (!IS_UPLOAD_SERVER) {
      const res = await QiniuUtils.getQiniuStat(QINIU_KODO.hssblog.bucket, key);
      flag = res.flag;
    } else {
      const filename = `${hash}.${ext}`;
      const url = `${STATIC_DIR}${prefix}${filename}`;
      flag = existsSync(url);
    }
    if (flag) {
      successHandler({
        code: 3,
        ctx,
        msg: '文件已存在，无需merge，请直接调用upload',
      });
    } else {
      const redisData = await redisController.getVal({
        prefix: REDIS_PREFIX.fileProgress,
        key: hash,
      });
      if (redisData) {
        successHandler({
          code: 1,
          ctx,
          data: JSON.parse(redisData),
          msg: '获取上传进度成功！',
        });
      } else {
        successHandler({
          code: 2,
          ctx,
          msg: `没有该文件的上传进度！`,
        });
      }
    }
    await next();
  };

  // 批量获取文件信息
  getBatchFileInfo = async (ctx: ParameterizedContext, next) => {
    const result = await this.batchFileInfo([
      { srcBucket: 'hssblog', key: 'image/1678937683585girl.jpg' },
      { srcBucket: 'hssblog', key: 'image/1659282130802monorepo.jpg' },
      { srcBucket: 'hssblog', key: 'image/1659282130802monorepo.jpg' },
    ]);
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await qiniuDataService.find(id);
    if (!result) {
      throw new CustomError(
        `不存在id为${id}的资源记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const qiniudataRes = await qiniuDataService.delete(id);
    const qiniuOfficialRes = await QiniuUtils.delete(
      result.qiniu_key,
      result.bucket
    );
    const cdnUrl = `${QINIU_KODO.hssblog.url}/${result.qiniu_key!}`;
    successHandler({
      ctx,
      data: `${
        qiniudataRes === 1
          ? `删除id:${id}资源记录成功`
          : `删除id:${id}资源记录失败`
      }，${
        qiniuOfficialRes.flag
          ? `删除${cdnUrl}资源成功`
          : `删除${cdnUrl}资源失败`
      }`,
    });

    await next();
  }

  async deleteByQiniuKey(ctx: ParameterizedContext, next) {
    const { qiniu_key } = ctx.request.query as {
      qiniu_key: string;
    };
    const qiniuOfficialRes = await QiniuUtils.delete(
      qiniu_key,
      QINIU_KODO.hssblog.bucket
    );
    const result = await qiniuDataService.findByQiniuKey(qiniu_key);
    const cdnUrl = `${QINIU_KODO.hssblog.url}/${qiniu_key}`;

    if (!result) {
      successHandler({
        ctx,
        data: `不存在${qiniu_key}的资源记录！，${
          qiniuOfficialRes.flag
            ? `资源${cdnUrl}删除成功！`
            : `资源${cdnUrl}删除失败！`
        }`,
      });
    } else {
      const { id } = result;
      const qiniudataRes = await qiniuDataService.delete(id!);

      successHandler({
        ctx,
        data: `${
          qiniudataRes === 1
            ? `删除id:${result.id!}资源记录成功！`
            : `删除id:${result.id!}资源记录失败！`
        }，${
          qiniuOfficialRes.flag
            ? `删除${cdnUrl}资源成功！`
            : `删除${cdnUrl}资源失败！`
        }`,
      });
    }

    await next();
  }

  getQiniuListPrefix = async (prefix: string): Promise<any[]> => {
    const list: any = [];
    const limit = 1000;
    const { respInfo, respBody }: any = await QiniuUtils.getListPrefix({
      limit,
      prefix,
    });
    let { marker } = respBody;
    const { items } = respInfo.data;
    list.push(...items);
    while (marker) {
      // eslint-disable-next-line no-await-in-loop
      const res: any = await QiniuUtils.getListPrefix({
        marker,
        limit,
      });
      list.push(...res.respInfo.data.items);
      marker = res.respBody.marker;
    }
    return list;
  };

  // 对比差异
  getDiff = async (ctx: ParameterizedContext, next) => {
    const { prefix }: any = ctx.request.query;
    if (
      !QINIU_KODO['hss-backup'].prefix[prefix] &&
      !QINIU_KODO.hssblog.prefix[prefix]
    ) {
      throw new CustomError(
        '错误的prefix',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const qiniuOfficialRes = await this.getQiniuListPrefix(prefix);
    const qiniuDataRes = await qiniuDataService.getPrefixList(prefix);
    const qiniuOfficialResMap = {};
    const qiniuDataResMap = {};
    qiniuOfficialRes.forEach((item) => {
      qiniuOfficialResMap[item.key] = item;
    });
    qiniuDataRes.rows.forEach((item) => {
      // @ts-ignore
      qiniuDataResMap[item.qiniu_key] = item;
    });
    const officialDiff: any = [];
    const qiniudataDiff: any = [];
    // 遍历七牛云官方文件
    Object.keys(qiniuOfficialResMap).forEach((item) => {
      if (qiniuOfficialResMap[item] && !qiniuDataResMap[item]?.get()) {
        officialDiff.push(item);
      }
    });
    // 遍历qiniudata
    Object.keys(qiniuDataResMap).forEach((item) => {
      if (qiniuDataResMap[item]?.get() && !qiniuOfficialResMap[item]) {
        qiniudataDiff.push(item);
      }
    });

    successHandler({
      ctx,
      data: { officialDiff, qiniudataDiff },
    });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const { bucket, prefix, qiniu_key }: any = ctx.request.body;
    if (
      !QINIU_KODO['hss-backup'].prefix[prefix] &&
      !QINIU_KODO.hssblog.prefix[prefix]
    ) {
      throw new CustomError(
        '错误的prefix',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const id = +ctx.params.id;
    const file: any = await qiniuDataService.find(id);
    if (!file) {
      throw new CustomError(
        `不存在id为${id}的文件！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    // eslint-disable-next-line
    const { flag, respErr, respBody, respInfo } =
      await QiniuUtils.updateQiniuFile(
        bucket,
        file.qiniu_key,
        QINIU_KODO.hssblog.bucket,
        qiniu_key
      );
    if (flag) {
      const result = await QiniuUtils.getQiniuStat(bucket, qiniu_key);
      await qiniuDataService.update({
        id,
        qiniu_key,
        qiniu_fsize: result.respBody.fsize,
        qiniu_md5: result.respBody.md5,
        qiniu_putTime: String(result.respBody.putTime),
        qiniu_type: result.respBody.type,
        qiniu_mimeType: result.respBody.mimeType,
        qiniu_hash: result.respBody.hash,
      });
      successHandler({ ctx, data: '更新成功！' });
    } else {
      throw new CustomError(
        `更新失败`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await next();
  }

  /**
   * 监控cdn流量（最近一周的cdn流量）
   */
  monitCDN() {
    const cdnManager = QiniuUtils.getQiniuCdnManager();
    // 域名列表
    const domains = [
      QINIU_KODO.hssblog.domain,
      QINIU_KODO['hss-backup'].domain,
    ];
    const { startDate, endDate } = getLastestWeek();
    const granularity = 'day'; // 粒度，取值：5min ／ hour ／day
    return new Promise((resolve, reject) => {
      const start = dayjs(startDate).format('YYYY-MM-DD');
      const end = dayjs(endDate).format('YYYY-MM-DD');
      // 获取域名流量
      cdnManager.getFluxData(
        start,
        end,
        granularity,
        domains,
        // eslint-disable-next-line consistent-return
        (err, respBody) => {
          if (err) {
            reject(err);
            return;
          }
          const fluxData = respBody.data;
          let allDomainNameFlux = 0;

          domains.forEach((domain) => {
            const fluxDataOfDomain = fluxData[domain];
            if (fluxDataOfDomain != null) {
              // console.log(`域名: ${domain} 使用的流量情况:`);
              const fluxChina: number = (fluxDataOfDomain.china || []).reduce(
                (pre: number, val: number) => pre + val,
                0
              );
              const fluxOversea: number = (
                fluxDataOfDomain.oversea || []
              ).reduce((pre: number, val: number) => pre + val, 0);
              // console.log(`域名: ${domain}使用的国内流量:`, fluxChina);
              // console.log(`域名: ${domain}使用的海外流量:`, fluxOversea);
              console.log(
                chalkWARN(
                  `域名:${domain}最近一周使用的总流量:${formatMemorySize(
                    fluxChina + fluxOversea
                  )}`
                )
              );
              allDomainNameFlux += fluxChina + fluxOversea;
            } else {
              console.log(chalkWARN(`域名: ${domain}最近一周没有流量数据`));
            }
          });
          console.log(
            chalkWARN(
              `所有域名最近一周使用的总流量: ${formatMemorySize(
                allDomainNameFlux
              )}`
            )
          );
          resolve({ allDomainNameFlux, start, end });
        }
      );
    });
  }
}

export default new QiniuController();
