import Router from 'koa-router';

import qiniuController from '@/controller/qiniuData.controller';
import { verifyEnv } from '@/middleware/qiniuData.middleware';

const qiniuRouter = new Router({ prefix: '/qiniu_data' });

// TIP 路由==》控制器
// TIP 控制器（比如删除图片）不需要关心用户权限，因为用户只能调用接口，只要在接口加上中间件即可限制用户不进入控制器即可
// WARN 需要注意的是，业务上能解耦的尽量解耦，比如新增/删除文章，这两个操作都会涉及到封面图，
// WARN 不要在新增/删除文章的控制器里面直接调用七牛云控制器，操作文章就仅仅操作文章可以了，别涉及到七牛云控制器的操作，如果确实需要的，就让前端在操作文章后，主动调七牛云的接口操作

// 获取token
// qiniuRouter.get('/get_token', qiniuController.getToken);

qiniuRouter.get('/list', qiniuController.getList);

qiniuRouter.post('/prefetch', qiniuController.prefetch);

// 对比差异
qiniuRouter.get('/diff', qiniuController.getDiff);

// 上传文件，只支持一次性上传一个文件
qiniuRouter.post('/upload', verifyEnv, qiniuController.upload);

// 上传chunk
qiniuRouter.post('/upload_chunk', verifyEnv, qiniuController.uploadChunk);

// 合并chunk
qiniuRouter.post('/merge_chunk', verifyEnv, qiniuController.mergeChunk);

// 上传文件，只支持一次性上传多个文件
qiniuRouter.post('/mulit_upload', verifyEnv, qiniuController.upload);

// 文件进度
qiniuRouter.get('/progress', verifyEnv, qiniuController.getProgress);

qiniuRouter.get('/batch_list', verifyEnv, qiniuController.getBatchFileInfo);

qiniuRouter.delete('/delete/:id', verifyEnv, qiniuController.delete);

qiniuRouter.delete(
  '/delete_by_qiniukey',
  verifyEnv,
  qiniuController.deleteByQiniuKey
);

qiniuRouter.put('/update/:id', verifyEnv, qiniuController.update);

qiniuRouter.post('/sync_qiniu_data', verifyEnv, qiniuController.syncQiniuData);

export default qiniuRouter;
