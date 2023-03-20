import Router from 'koa-router';

import blacklistController from '@/controller/blacklist.controller';

const blacklistRouter = new Router({ prefix: '/blacklist' });

// 黑名单列表
blacklistRouter.get('/list', blacklistController.getList);

// 创建黑名单
blacklistRouter.post('/create', blacklistController.create);

// 查找黑名单
blacklistRouter.get('/find/:id', blacklistController.find);

// 更新黑名单
blacklistRouter.put('/update/:id', blacklistController.update);

// 删除黑名单
blacklistRouter.delete('/delete/:id', blacklistController.delete);

export default blacklistRouter;
