import Router from 'koa-router';

import deskUserController from '@/controller/deskUser.controller';

const deskUserRouter = new Router({ prefix: '/desk_user' });

deskUserRouter.get(
  '/find_receiver_by_uuid',
  deskUserController.findReceiverByUuid
);

deskUserRouter.post('/login', deskUserController.login);

deskUserRouter.post('/link_verify', deskUserController.linkVerify);

deskUserRouter.post('/create', deskUserController.create);

deskUserRouter.put('/update_by_uuid', deskUserController.updateByUuid);

export default deskUserRouter;
