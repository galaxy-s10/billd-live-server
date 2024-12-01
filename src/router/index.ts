import fs from 'fs';

import Router from 'koa-router';

import { PROJECT_ENV, PROJECT_ENV_ENUM, PROJECT_NAME } from '@/constant';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

const router = new Router();

export function loadAllRoutes(app) {
  router.get('/', async (ctx, next) => {
    ctx.body = {
      msg: `欢迎访问${PROJECT_NAME},当前环境是:${PROJECT_ENV},当前时间:${new Date().toLocaleString()}`,
    };
    await next();
  });
  app.use(router.routes()).use(router.allowedMethods()); // 每一个router都要配置routes()和allowedMethods()

  const err: string[] = [];
  fs.readdirSync(__dirname).forEach((file) => {
    try {
      if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
        if (file === 'index.ts') return;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
        if (file === 'index.ts') return;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
        if (file === 'index.js') return;
      } else if (file === 'index.js') return;

      const allRouter = require(`./${file}`).default;
      app.use(allRouter.routes()).use(allRouter.allowedMethods()); // allRouter也要配置routes()和allowedMethods()
      // router.use('/front', allRouter.routes()).use(allRouter.allowedMethods()); // front的router也要配置routes()和allowedMethods()
      // router.use('/admin', allRouter.routes()).use(allRouter.allowedMethods()); // admin的router也要配置routes()和allowedMethods()
      console.log(chalkINFO(`加载路由: ${file}`));
    } catch (error) {
      err.push(file);
      console.log(chalkERROR(`加载路由: ${file}出错!`));
      console.log(error);
    }
  });
  if (err.length) {
    console.log(chalkERROR(`加载路由: ${err.toString()}出错！`));
    throw new Error('');
  } else {
    console.log(chalkSUCCESS('加载所有路由成功！'));
  }
}
