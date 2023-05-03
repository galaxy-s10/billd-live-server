// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init';

import { exec } from 'child_process';
import path from 'path';

import Koa from 'koa';
import koaBody from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import staticService from 'koa-static';

import { catchErrorMiddle, corsMiddle } from '@/app/app.middleware';
import errorHandler from '@/app/handler/error-handle';
import { apiBeforeVerify } from '@/app/verify.middleware';
import { connectMysql } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { connectNodeMediaServer } from '@/config/stream';
import { connectWebSocket } from '@/config/websocket';
import {
  PROJECT_ENV,
  PROJECT_NAME,
  PROJECT_PORT,
  STATIC_DIR,
  UPLOAD_DIR,
} from '@/constant';
import { initDb } from '@/init/initDb';
import { CustomError } from '@/model/customError.model';
import { loadAllRoutes } from '@/router';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

function runServer() {
  const port = +PROJECT_PORT; // 端口
  const app = new Koa();
  // app.proxyIpHeader 代理 ip 消息头, 默认为 X-Forwarded-For
  // app.proxyIpHeader = 'X-Real-IP';
  app.proxy = true;

  app.use(catchErrorMiddle); // 全局错误处理

  app.use(
    koaBody({
      multipart: true,
      formidable: {
        // 上传目录
        uploadDir: UPLOAD_DIR, // 默认os.tmpdir()
        // 保留文件扩展名
        keepExtensions: true,
        maxFileSize: 1024 * 1024 * 300, // 300m
        // onFileBegin(name, file) {
        //   file.filepath = '可覆盖地址';
        // },
      },
      onError(err) {
        console.log('koaBody错误', err);
        throw new CustomError(err.message, 500, 500);
      },
      // parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // 声明将解析正文的 HTTP 方法，默认值['POST', 'PUT', 'PATCH']。替换strict选项。
      // strict: true, // 废弃了。如果启用，则不解析 GET、HEAD、DELETE 请求，默认true。即delete不会解析data数据
    })
  ); // 解析参数

  app.use(
    staticService(STATIC_DIR, {
      maxage: 60 * 1000, // 缓存时间：1分钟
    })
  ); // 静态文件目录
  app.use(conditional()); // 接口缓存
  app.use(etag()); // 接口缓存
  app.use(corsMiddle); // 设置允许跨域
  app.on('error', errorHandler); // 接收全局错误，位置必须得放在最开头？
  async function main() {
    try {
      app.use(apiBeforeVerify); // 注意：需要在所有路由加载前使用这个中间件
      await Promise.all([
        connectMysql(), // 连接mysql
        connectRedis(), // 连接redis
      ]);
      initDb(3); // 加载sequelize的relation表关联
      loadAllRoutes(app); // 加载所有路由
      await new Promise((resolve) => {
        // 语法糖, 等同于http.createServer(app.callback()).listen(3000);
        const httpServer = app.listen(port, () => {
          resolve('ok');
        });
        connectWebSocket(httpServer); // 初始化websocket
      }); // http接口服务
      connectNodeMediaServer();
      console.log(chalkSUCCESS(`项目启动成功！`));
      console.log(chalkWARN(`当前监听的端口: ${port}`));
      console.log(chalkWARN(`当前的项目名称: ${PROJECT_NAME}`));
      console.log(chalkWARN(`当前的项目环境: ${PROJECT_ENV}`));
      try {
        const srsSh = `sh ${path.resolve(__dirname, '../srs.sh')}`;
        // const srsSh = `${path.resolve(__dirname, '../srs.sh')}`;
        const child = exec(srsSh, {}, (error, stream) => {
          console.log(chalkINFO(`${new Date().toLocaleString()}，有打印`));
          console.log(error, stream);
        });
        child.on('exit', () => {
          console.log(
            chalkINFO(`${new Date().toLocaleString()}，子进程退出了，${srsSh}`)
          );
        });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(chalkERROR(`项目启动失败！`));
      console.log(error);
    }
  }
  main();
}

runServer();

// const numCPUs = cpus().length;

// if (cluster.isPrimary) {
//   console.log(`Primary ${process.pid} is running`);
//   for (let i = 0; i < numCPUs; i += 1) {
//     cluster.fork();
//   }
// } else if (cluster.isWorker) {
//   console.log(`Current process ${process.pid}`);
// }
