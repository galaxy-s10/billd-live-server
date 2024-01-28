import Router from 'koa-router';

import signinController from '@/controller/signin.controller';

const signinRouter = new Router({ prefix: '/signin' });

signinRouter.get('/list', signinController.getList);

signinRouter.get('/today_is_signin', signinController.todayIsSignin);

signinRouter.post('/create', signinController.create);

signinRouter.get('/find/:id', signinController.find);

signinRouter.put('/update/:id', signinController.update);

signinRouter.delete('/delete/:id', signinController.delete);

export default signinRouter;
