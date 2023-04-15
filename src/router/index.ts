import fs from 'fs';

import Router from 'koa-router';

import { PROJECT_ENV, PROJECT_NAME, PROJECT_NODE_ENV } from '@/constant';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

const router = new Router();

export function loadAllRoutes(app) {
  router.get('/', async (ctx, next) => {
    ctx.body = {
      message: `欢迎访问${PROJECT_NAME},当前环境是:${PROJECT_ENV},当前时间:${new Date().toLocaleString()}`,
    };
    await next();
  });
  app.use(router.routes()).use(router.allowedMethods()); // 每一个router都要配置routes()和allowedMethods()

  fs.readdirSync(__dirname).forEach((file) => {
    try {
      if (PROJECT_NODE_ENV === 'development') {
        if (file === 'index.ts') return;
      } else if (file === 'index.js') return;

      const allRouter = require(`./${file}`).default;
      app.use(allRouter.routes()).use(allRouter.allowedMethods()); // allRouter也要配置routes()和allowedMethods()
      // router.use('/front', allRouter.routes()).use(allRouter.allowedMethods());
      router.use('/admin', allRouter.routes()).use(allRouter.allowedMethods()); // admin的router也要配置routes()和allowedMethods()
      console.log(chalkINFO(`加载路由: ${file}`));
    } catch (error) {
      console.log(chalkERROR(`加载${file}路由出错:`));
      console.log(error);
    }
  });
  console.log(chalkSUCCESS('加载所有route成功~'));
}
