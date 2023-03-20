import Router from 'koa-router';

import tagController from '@/controller/tag.controller';
import { verifyProp } from '@/middleware/tag.middleware';

const tagRouter = new Router({ prefix: '/tag' });

// 标签列表
tagRouter.get('/list', tagController.getList);

// 标签文章列表
tagRouter.get('/article_list/:tag_id', tagController.getArticleList);

// 查找标签
tagRouter.get('/find/:id', tagController.find);

// 删除标签
tagRouter.delete('/delete/:id', tagController.delete);

// 创建标签
tagRouter.post('/create', verifyProp, tagController.create);

// 更新标签
tagRouter.put('/update/:id', verifyProp, tagController.update);

export default tagRouter;
