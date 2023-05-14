// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init/alias';

import { connectMysql } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { createRedisPubSub } from '@/config/redis/pub';
import { startSchedule } from '@/config/schedule';
import { MYSQL_CONFIG } from '@/config/secret';
import { PROJECT_ENV, PROJECT_NAME, PROJECT_PORT } from '@/constant';
import { handleSecretFile, handleUploadDir } from '@/init';
import { initDb } from '@/init/initDb';
import { initFFmpeg } from '@/init/initFFmpeg';
import { initSRS } from '@/init/initSRS';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

async function main() {
  try {
    handleSecretFile(); // 处理秘钥文件(src.config/secret.ts)
    handleUploadDir(); // 处理文件上传目录(src/upload)
    await Promise.all([
      connectMysql(), // 连接mysql
      connectRedis(), // 连接redis
      createRedisPubSub(), // 创建redis的发布订阅
    ]);
    await initDb('load');
    initSRS(); // 初始化srs
    initFFmpeg(); // 初始化FFmpeg
    startSchedule();
    const port = +PROJECT_PORT;
    (await import('./setup')).setupKoa({ port });
    console.log(chalkSUCCESS(`项目启动成功！`));
    console.log(chalkWARN(`监听端口: ${port}`));
    console.log(chalkWARN(`项目名称: ${PROJECT_NAME}`));
    console.log(chalkWARN(`项目环境: ${PROJECT_ENV}`));
    console.log(chalkWARN(`mysql数据库: ${MYSQL_CONFIG.database}`));
  } catch (error) {
    console.log(error);
    console.log(chalkERROR('项目启动失败！'));
  }
}

main();
