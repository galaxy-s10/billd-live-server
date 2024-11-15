// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init/alias';
import './init/initFile';

import { performance } from 'perf_hooks';

import { connectMysql } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { createRedisPubSub } from '@/config/redis/pub';
import {
  PROJECT_ENV,
  PROJECT_INIT_MYSQL,
  PROJECT_NAME,
  PROJECT_PORT,
} from '@/constant';
import { MYSQL_CONFIG } from '@/secret/secret';
import { getIpAddress } from '@/utils';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

const start = performance.now();

async function main() {
  function adLog() {
    console.log();

    console.log(chalkINFO(`作者微信:    shuisheng9905`));
    console.log(chalkINFO(`付费课程:    https://www.hsslive.cn/article/151`));
    console.log(
      chalkINFO(`私有化部署:   https://live.hsslive.cn/privatizationDeployment`)
    );
    console.log(
      chalkINFO(
        `欢迎PR:      billd-live目前只有作者一人开发，难免有不足的地方，欢迎提PR或Issue`
      )
    );
    console.log();
  }
  if (PROJECT_INIT_MYSQL === 'true') {
    await connectMysql(true); // 连接mysql
    await (
      await import('./controller/init.controller')
    ).default.common.initDefault();
    console.log(chalkSUCCESS(`初始化数据库数据完成！请退出该命令！`));
    return;
  }
  try {
    await Promise.all([
      connectMysql(), // 连接mysql
      connectRedis(), // 连接redis
      createRedisPubSub(), // 创建redis的发布订阅
    ]);
  } catch (error) {
    console.log(chalkERROR('mysql或redis初始化失败！'));
    console.log(error);
    // 触发pm2的重启进程
    process.exit(1);
  }
  try {
    const port = +PROJECT_PORT;
    await (await import('./setup')).setupKoa({ port });
    console.log();
    console.log(chalkWARN(`监听端口: ${port}`));
    console.log(chalkWARN(`项目名称: ${PROJECT_NAME}`));
    console.log(chalkWARN(`项目环境: ${PROJECT_ENV}`));
    console.log(chalkWARN(`mysql host: ${MYSQL_CONFIG.host}`));
    console.log(chalkWARN(`mysql数据库: ${MYSQL_CONFIG.database}`));
    getIpAddress().forEach((ip) => {
      console.log(chalkSUCCESS(`http://${ip}:${port}/`));
    });
    console.log(
      chalkSUCCESS(
        `项目启动成功！耗时：${Math.floor(performance.now() - start)}ms`
      )
    );
    adLog();
  } catch (error) {
    console.log(error);
    console.log(chalkERROR('项目启动失败！'));
    adLog();
  }
}

main();
