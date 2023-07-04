import Router from 'koa-router';

import srsController from '@/controller/srs.controller';

const srsRouter = new Router({ prefix: '/srs' });

srsRouter.post('/rtcV1Publish', srsController.rtcV1Publish);

srsRouter.post('/rtcV1Play', srsController.rtcV1Play);

export default srsRouter;
