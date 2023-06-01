// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init/alias';
import './init/initFile';

import { connectMysql, dbName } from '@/config/mysql';
import { connectRabbitMQ } from '@/config/rabbitmq';
import { connectRedis } from '@/config/redis';
import { createRedisPubSub } from '@/config/redis/pub';
import { startSchedule } from '@/config/schedule';
import { PROJECT_ENV, PROJECT_NAME, PROJECT_PORT } from '@/constant';
import { initDb } from '@/init/initDb';
import { initFFmpeg } from '@/init/initFFmpeg';
import { initSRS } from '@/init/initSRS';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

import { initRabbitMQConsumer } from './config/rabbitmq/consumer';

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
    await Promise.all([
      connectRabbitMQ(), // 连接rabbitMQ
      connectMysql(), // 连接mysql
      connectRedis(), // 连接redis
      createRedisPubSub(), // 创建redis的发布订阅
    ]);
    initRabbitMQConsumer();
    await initDb('load');
    initSRS(false); // 初始化srs
    await initFFmpeg(false); // 初始化FFmpeg
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
