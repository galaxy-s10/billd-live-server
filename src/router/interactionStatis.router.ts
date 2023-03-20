import Router from 'koa-router';

import interactionController from '@/controller/interaction.controller';

const interactionRouter = new Router({ prefix: '/interaction_statis' });

// 互动统计列表
interactionRouter.get('/list', interactionController.getList);

// // 创建互动统计
// linkRouter.post('/create', verifyProp, linkController.create);

// // 查找互动统计
// linkRouter.get('/find/:id', linkController.find);

// // 更新互动统计
// linkRouter.put('/update/:id', verifyProp, linkController.update);

// // 删除互动统计
// linkRouter.delete('/delete/:id', linkController.delete);

export default interactionRouter;
