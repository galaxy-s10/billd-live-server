import Router from 'koa-router';

import musicController from '@/controller/music.controller';
import { verifyProp } from '@/middleware/music.middleware';

const musicRouter = new Router({ prefix: '/music' });

// 音乐列表
musicRouter.get('/list', musicController.getList);

// 创建音乐
musicRouter.post('/create', verifyProp, musicController.create);

// 更新音乐
musicRouter.put('/update/:id', verifyProp, musicController.update);

// 查找音乐
musicRouter.get('/find/:id', musicController.find);

// 删除音乐
musicRouter.delete('/delete/:id', musicController.delete);

export default musicRouter;
