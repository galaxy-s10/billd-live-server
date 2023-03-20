import Router from 'koa-router';

import articleTagController from '@/controller/articleTag.controller';
import { verifyProp } from '@/middleware/articleTag.middleware';

const articleRouter = new Router({ prefix: '/article_tag' });

// 文章标签列表
articleRouter.get('/list', articleTagController.getList);

// 创建文章标签
articleRouter.post('/create', verifyProp, articleTagController.create);

export default articleRouter;
