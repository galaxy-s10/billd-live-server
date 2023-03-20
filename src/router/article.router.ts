import Router from 'koa-router';

import articleController from '@/controller/article.controller';
import { verifyProp } from '@/middleware/article.middleware';

const articleRouter = new Router({ prefix: '/article' });

// 压力测试
articleRouter.get('/test', articleController.test);

// 文章列表
articleRouter.get('/list', articleController.getList);

// 搜索文章列表
articleRouter.get('/keyword_list', articleController.getKeyWordList);

// 查找文章
articleRouter.get('/find/:id', articleController.find);

// 新增文章
articleRouter.post('/create', verifyProp, articleController.create);

// 更新文章
articleRouter.put('/update/:id', verifyProp, articleController.update);

// 删除文章
articleRouter.delete('/delete/:id', verifyProp, articleController.delete);

export default articleRouter;
