import Router from 'koa-router';

import githubUserController from '@/controller/githubUser.controller';

const githubUserRouter = new Router({ prefix: '/github_user' });

// 用户列表
githubUserRouter.get('/list', githubUserController.list);

// 用户列表
githubUserRouter.get('/stargazers', githubUserController.getRepoStargazers);

// 用户github登录
githubUserRouter.post('/login', githubUserController.login);

// 绑定github
githubUserRouter.post('/bind_github', githubUserController.bindGithub);

// 取消绑定github
githubUserRouter.post(
  '/cancel_bind_github',
  githubUserController.cancelBindGithub
);

// 查找用户
githubUserRouter.get('/find/:id', githubUserController.find);

// 更新用户
githubUserRouter.put('/update/:id', githubUserController.update);

// 删除用户
githubUserRouter.delete('/delete/:id', githubUserController.delete);

export default githubUserRouter;
