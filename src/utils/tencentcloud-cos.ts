import COS from 'cos-nodejs-sdk-v5';
import STS from 'qcloud-cos-sts';

import { TENCENTCLOUD_SECRETID, TENCENTCLOUD_SECRETKEY } from '@/secret/secret';
import { TENCENTCLOUD_COS } from '@/spec-config';

export const getPolicyByRes = (data: { prefix: string }) => {
  // 配置参数
  const config = {
    secretId: TENCENTCLOUD_SECRETID, // 固定密钥
    secretKey: TENCENTCLOUD_SECRETKEY, // 固定密钥
    durationSeconds: 1800, // 密钥有效期
    allowActions: [
      // 简单上传
      'name/cos:PutObject',
      'name/cos:PostObject',
      // 分片上传
      'name/cos:InitiateMultipartUpload',
      'name/cos:ListMultipartUploads',
      'name/cos:ListParts',
      'name/cos:UploadPart',
      'name/cos:CompleteMultipartUpload',
    ],
    bucket: TENCENTCLOUD_COS['res-1305322458'].Bucket, // 换成你的 bucket
    region: TENCENTCLOUD_COS['res-1305322458'].Region, // 换成 bucket 所在地区
  };

  // 获取临时密钥
  const shortBucketName = config.bucket.substr(
    0,
    config.bucket.lastIndexOf('-')
  );
  const appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'));
  const policy = {
    version: '2.0',
    statement: [
      {
        action: config.allowActions,
        effect: 'allow',
        principal: { qcs: ['*'] },
        resource: [
          `qcs::cos:${config.region}:uid/${appId}:prefix//${appId}/${shortBucketName}/${data.prefix}*`,
        ],
      },
    ],
  };
  return new Promise((resolve) => {
    STS.getCredential(
      {
        secretId: TENCENTCLOUD_SECRETID, // 固定密钥
        secretKey: TENCENTCLOUD_SECRETKEY, // 固定密钥
        policy,
        proxy: '',
        host: 'sts.tencentcloudapi.com', // 域名，非必须，默认为 sts.tencentcloudapi.com
        durationSeconds: config.durationSeconds,
      },
      (err, credential) => {
        resolve({ err, credential });
      }
    );
  });
};

export const tencentcloudCosClient = new COS({
  SecretId: TENCENTCLOUD_SECRETID, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://www.tencentcloud.com/document/product/598/37140?from_cn_redirect=1
  SecretKey: TENCENTCLOUD_SECRETKEY, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://www.tencentcloud.com/document/product/598/37140?from_cn_redirect=1
  FileParallelLimit: 10, // 同一个实例下上传的文件并发数，默认值3
  ChunkParallelLimit: 10, // 同一个上传文件的分块并发数，默认值3
});
