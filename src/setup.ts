import Koa from 'koa';
import koaBody from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import staticService from 'koa-static';

import { initSchedule } from '@/config/schedule';
import { connectWebSocket } from '@/config/websocket';
import { COMMON_HTTP_CODE, STATIC_DIR, UPLOAD_DIR } from '@/constant';
import { initFFmpeg } from '@/init/initFFmpeg';
import { apiBeforeVerify } from '@/middleware/apiBeforeVerify.middleware';
import { catchError } from '@/middleware/catchError.middleware';
import { cors } from '@/middleware/cors.middleware';
import { CustomError } from '@/model/customError.model';
import { loadAllRoutes } from '@/router';
import { countdown } from '@/utils';
import { pushToBilibili } from '@/utils/process';

export async function setupKoa({ port }) {
  const app = new Koa();
  // app.proxyIpHeader 代理 ip 消息头, 默认为 X-Forwarded-For
  // app.proxyIpHeader = 'X-Real-IP';
  app.proxy = true;

  app.use(catchError); // 全局错误处理
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
        throw new CustomError({
          msg: err.message,
          httpStatusCode: COMMON_HTTP_CODE.serverError,
          errorCode: COMMON_HTTP_CODE.serverError,
        });
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
  app.use(cors); // 设置允许跨域
  app.use(apiBeforeVerify); // 注意：需要在所有路由加载前使用这个中间件

  loadAllRoutes(app); // 加载所有路由
  await new Promise((resolve) => {
    // 语法糖, 等同于http.createServer(app.callback()).listen(3000);
    const httpServer = app.listen(port, () => {
      resolve('ok');
    });
    connectWebSocket(httpServer); // 初始化websocket
  }); // http接口服务
  initSchedule();
  pushToBilibili(false);
  const useInitFFmpeg = true;
  if (useInitFFmpeg) {
    setTimeout(() => {
      const countdownInitFFmpegDelay = 3;
      countdown({ seconds: countdownInitFFmpegDelay });
      setTimeout(() => {
        // 初始化FFmpeg推流
        initFFmpeg(true);
      }, 1000 * (countdownInitFFmpegDelay + 1));
    }, 500);
  }
}
