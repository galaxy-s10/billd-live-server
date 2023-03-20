import Router from 'koa-router';

import themeController from '@/controller/theme.controller';

const themeRouter = new Router({ prefix: '/theme' });

// 主题列表
themeRouter.get('/list', themeController.getList);

// 创建主题
themeRouter.post('/create', themeController.create);

// 查找主题
themeRouter.get('/find/:id', themeController.find);

// 更新主题
themeRouter.put('/update/:id', themeController.update);

// 删除主题
themeRouter.delete('/delete/:id', themeController.delete);

export default themeRouter;
