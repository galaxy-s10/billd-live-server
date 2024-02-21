import { arrayUnique, getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, REDIS_PREFIX, THIRD_PLATFORM } from '@/constant';
import authController from '@/controller/auth.controller';
import redisController from '@/controller/redis.controller';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import roleService from '@/service/role.service';
import userService from '@/service/user.service';
import { IUser } from '@/types/IUser';

class UserController {
  common = {
    list: (data) => userService.getList(data),
  };

  qrCodeLoginStatus = async (ctx: ParameterizedContext, next) => {
    const { platform, login_id } = ctx.request.query as {
      platform: string;
      login_id: string;
    };
    if (!THIRD_PLATFORM[platform]) {
      throw new CustomError(
        'platform错误！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await redisController.getVal({
      prefix: REDIS_PREFIX.qrCodeLogin,
      key: `${platform}___${login_id}`,
    });
    if (!res) {
      successHandler({ ctx, data: { isLogin: false } });
    } else {
      const origin = JSON.parse(res);
      successHandler({ ctx, data: origin.value });
    }
    await next();
  };

  qrCodeLogin = async (ctx: ParameterizedContext, next) => {
    const { platform }: { platform: string } = ctx.request.body;
    if (!THIRD_PLATFORM[platform]) {
      throw new CustomError(
        'platform错误！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    let { exp } = ctx.request.body;
    const maxExp = 24 * 7; // token过期时间：7天
    if (!exp) {
      exp = 24;
    } else if (exp > maxExp) {
      exp = maxExp;
    }
    const createDate = {
      login_id: getRandomString(8),
      exp,
      platform,
      isLogin: false,
      token: '',
    };
    const redisExp = 60 * 5;
    await redisController.setExVal({
      prefix: REDIS_PREFIX.qrCodeLogin,
      key: `${platform}___${createDate.login_id}`,
      exp: redisExp,
      value: createDate,
    });
    successHandler({ ctx, data: createDate });
    await next();
  };

  login = async (ctx: ParameterizedContext, next) => {
    const { id, password } = ctx.request.body;
    let { exp } = ctx.request.body;
    const maxExp = 24 * 7; // token过期时间：7天
    if (!exp) {
      exp = 24;
    } else if (exp > maxExp) {
      exp = maxExp;
    }
    const userInfo = await userService.login({ id, password });
    if (!userInfo) {
      throw new CustomError(
        '账号或密码错误！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const token = signJwt({
      userInfo,
      exp,
    });
    await userService.update({ token, id: userInfo?.id }); // 每次登录都更新token
    successHandler({ ctx, data: token, message: '登录成功！' });

    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  list = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IUser> = ctx.request.query;
    const result = await this.common.list({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await userService.findAccount(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async getUserInfo(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const [auths, result] = await Promise.all([
      authController.common.getUserAuth(userInfo.id!),
      userService.getUserInfo(userInfo.id!),
    ]);
    // 获取纯净的对象，避免循环引用
    successHandler({ ctx, data: { ...result?.get({ plain: true }), auths } });
    await next();
  }

  async updatePwd(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const { oldpwd, newpwd } = ctx.request.body;
    if (!oldpwd || !newpwd) {
      throw new CustomError(
        `oldpwd和newpwd不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const user = await userService.findPwd(userInfo.id!);
    if (user?.password !== oldpwd) {
      throw new CustomError(
        `旧密码错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await userService.updatePwd({
      id: userInfo.id,
      password: newpwd,
    });
    successHandler({ ctx, message: '修改密码成功！' });
    await next();
  }

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { username, desc, status, avatar }: IUser = ctx.request.body;
    if (!username) {
      throw new CustomError(
        'username不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExist = await userService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExistSameName = await userService.isSameName(username);
    if (isExistSameName && isExistSameName.id !== id) {
      throw new CustomError(
        `已存在用户名为${username}的用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await userService.update({
      id,
      username,
      desc,
      status,
      avatar,
    });
    successHandler({ ctx });

    await next();
  };

  async updateUserRole(ctx: ParameterizedContext, next) {
    const user_id = +ctx.params.id;
    const { user_roles }: IUser = ctx.request.body;

    if (!user_roles || !user_roles.length) {
      throw new CustomError(
        'user_roles要求number[]！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const isExistUser = await userService.isExist([user_id]);
    if (!isExistUser) {
      throw new CustomError(
        `不存在id为${user_id}的用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const ids = arrayUnique(user_roles);
    const isExistRole = await roleService.isExist(ids);
    if (!isExistRole) {
      throw new CustomError(
        `${ids.toString()}中存在不存在的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await roleService.updateUserRole({
      user_id,
      role_ids: user_roles,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  delete(ctx: ParameterizedContext, next) {
    successHandler({ ctx, message: '敬请期待' });
    next();
  }
}
export default new UserController();
