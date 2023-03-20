import Router from 'koa-router';

import scheduleController from '@/controller/schedule.controller';

const scheduleRouter = new Router({ prefix: '/schedule' });

// 备份任务
scheduleRouter.get('/db_job', scheduleController.getDbJob);

// 立即执行备份任务
scheduleRouter.post('/invoke_db_job', scheduleController.invokeDbJob);

// 查看内存
scheduleRouter.get(
  '/invoke_showMemory_job',
  scheduleController.invokeShowMemoryJob
);

// 执行清除buff/cache任务
scheduleRouter.post(
  '/invoke_clearCache_job',
  scheduleController.invokeClearCacheJob
);

// 执行重启pm2
scheduleRouter.post('/restart_pm2', scheduleController.restartPm2);

export default scheduleRouter;
