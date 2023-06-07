// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init/alias';
import './init/initFile';

import { connectMysql, dbName } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { handleRedisKeyExpired } from '@/config/redis/handleRedisKeyExpired';
import { createRedisPubSub } from '@/config/redis/pub';
import { startSchedule } from '@/config/schedule';
import { PROJECT_ENV, PROJECT_NAME, PROJECT_PORT } from '@/constant';
import { dockerRunRabbitMQ } from '@/init/docker/RabbitMQ';
import { dockerRunSRS } from '@/init/docker/SRS';
import { initDb } from '@/init/initDb';
import { initFFmpeg } from '@/init/initFFmpeg';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

import { QiniuUtils } from './utils/qiniu';

async function main() {
  function adLog() {
    console.log();
    console.log(chalkINFO(`赞助打赏: https://live.hsslive.cn/sponsors`));
    console.log(chalkINFO(`付费支持: https://live.hsslive.cn/support`));
    console.log(
      chalkINFO(
        `欢迎PR:   billd-live目前只有作者一人开发，难免有不足的地方，欢迎提PR或Issue`
      )
    );
    console.log();
  }
  try {
    // const res = await QiniuUtils.createAFlow({ roomId: 333 });
    // const res1 = await QiniuUtils.queryAFlow({ roomId: 333 });
    // console.log(res, '---');
    // return;
    await Promise.all([
      connectMysql(), // 连接mysql
      connectRedis(), // 连接redis
      createRedisPubSub(), // 创建redis的发布订阅
    ]);
    await initDb('load');
    handleRedisKeyExpired();
    dockerRunRabbitMQ(true); // docker运行RabbitMQ
    dockerRunSRS(true); // docker运行SRS
    await initFFmpeg(true); // 初始化FFmpeg推流
    const res = await QiniuUtils.createAFlow({ roomId: 333 });
    const res1 = await QiniuUtils.queryAFlow({ roomId: 333 });
    return;
    startSchedule();
    const port = +PROJECT_PORT;
    (await import('./setup')).setupKoa({ port });
    console.log(chalkSUCCESS(`项目启动成功！`));
    console.log(chalkWARN(`监听端口: ${port}`));
    console.log(chalkWARN(`项目名称: ${PROJECT_NAME}`));
    console.log(chalkWARN(`项目环境: ${PROJECT_ENV}`));
    console.log(chalkWARN(`mysql数据库: ${dbName}`));
    adLog();
  } catch (error) {
    console.log(error);
    console.log(chalkERROR('项目启动失败！'));
    adLog();
  }
}

main();
