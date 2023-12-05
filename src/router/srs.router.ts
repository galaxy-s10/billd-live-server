import Router from 'koa-router';

import srsController from '@/controller/srs.controller';

const srsRouter = new Router({ prefix: '/srs' });

srsRouter.post('/rtcV1Publish', srsController.rtcV1Publish);

srsRouter.post('/rtcV1Play', srsController.rtcV1Play);

srsRouter.get('/apiV1Streams', srsController.getApiV1Streams);

srsRouter.get('/apiV1Clients', srsController.getApiV1Clients);

srsRouter.delete('/apiV1Clients/:clientId', srsController.deleteApiV1Clients);

srsRouter.delete('/audience/:id', srsController.deleteAudience);

// SRS http回调
srsRouter.post('/on_publish', srsController.onPublish);

// SRS http回调
srsRouter.post('/on_play', srsController.onPlay);

// SRS http回调
srsRouter.post('/on_stop', srsController.onStop);

// SRS http回调
srsRouter.post('/on_unpublish', srsController.onUnpublish);

// SRS http回调
srsRouter.post('/on_dvr', srsController.onDvr);

export default srsRouter;
