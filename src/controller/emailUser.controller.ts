import { ParameterizedContext } from 'koa';

import otherController from './other.controller';
import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  ALLOW_HTTP_CODE,
  REDIS_PREFIX,
  THIRD_PLATFORM,
  VERIFY_EMAIL_RESULT_CODE,
} from '@/constant';
import { IEmail, IEmailUser, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import emailUserService from '@/service/emailUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { emailContentTemplate, randomNumber, getRandomString } from '@/utils';

interface IKey {
  prefix: string;
  key: string;
}

class EmailUserController {
  async find(ctx: ParameterizedContext, next) {
    const { email } = ctx.request.query;
    const result = await emailUserService.findThirdUser(email as string);
    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 发送验证码
   * redis没有缓存，新建redis缓存，发送验证码
   * redis有缓存，判断是否在一分钟之内，在一分钟之内就提示过xx秒再发送；只有超过了一分钟才能继续发送验证码。
   * 返回值：VERIFY_EMAIL_RESULT_CODE
   */
  sendCode = async ({
    key,
    exp = 300,
    desc,
    subject,
  }: {
    key: IKey;
    exp?: number;
    desc: string;
    subject?: string;
  }) => {
    const oldIpdata = await redisController.getVal(key);
    if (!oldIpdata) {
      const verificationCode = getRandomString(6);
      const content = emailContentTemplate({
        code: verificationCode,
        desc,
        exp,
        subject,
      });
      await otherController.sendEmail(
        key.key,
        content.subject,
        `<h1>${content.content}</h1>`
      );
      await redisController.setExVal({
        ...key,
        value: verificationCode,
        exp,
      });
      return VERIFY_EMAIL_RESULT_CODE.ok;
    }
    const ttl: any = await redisController.getTTL(key);
    if (ttl > 60 * 4) {
      return VERIFY_EMAIL_RESULT_CODE.later;
    }
    const verificationCode = getRandomString(6);
    const content = emailContentTemplate({
      code: verificationCode,
      desc,
      exp,
      subject,
    });
    await otherController.sendEmail(
      key.key,
      content.subject,
      `<h1>${content.content}</h1>`
    );
    await redisController.setExVal({
      ...key,
      value: verificationCode,
      exp,
    });
    return VERIFY_EMAIL_RESULT_CODE.ok;
  };

  /** 邮箱登录（邮箱验证码登录） */
  login = async (ctx: ParameterizedContext, next) => {
    const { email, code, exp = 24 }: IEmail = ctx.request.body;
    if (!email) {
      throw new CustomError(
        'email不能为空！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const key = {
      prefix: REDIS_PREFIX.emailLogin,
      key: email,
    };
    // 判断redis中的验证码是否正确
    const redisData = await redisController.getVal(key);
    if (redisData !== code || !redisData) {
      throw new CustomError(
        '验证码错误或已过期！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const isExistEmail = await emailUserService.findByEmail(email);
    if (!isExistEmail) {
      throw new CustomError(
        `${email}还未绑定过用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const findEmailUserRes = await emailUserService.findThirdUser(email);
    // @ts-ignore
    const userInfo = findEmailUserRes.users[0];
    if (!userInfo) {
      throw new CustomError(
        `${email}用户有误，请联系管理员！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const token = signJwt({
      userInfo,
      exp,
    });
    await userService.update({ id: userInfo?.id, token }); // 每次登录都更新token
    await redisController.del(key);
    successHandler({ ctx, data: token, message: '登录成功！' });
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  /** 邮箱注册 */
  register = async (ctx: ParameterizedContext, next) => {
    const { email, code, exp = 24 }: IEmail = ctx.request.body;
    if (!email) {
      throw new CustomError(
        'email不能为空！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const reg = /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (!reg.test(email)) {
      throw new CustomError(
        '请输入正确的邮箱！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const emailIsExist = await emailUserService.emailsIsExist([email]);
    if (emailIsExist) {
      throw new CustomError(
        '该邮箱已被他人使用！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    } else {
      const key = {
        prefix: REDIS_PREFIX.emailRegister,
        key: email,
      };
      // 判断redis中的验证码是否正确
      const redisData = await redisController.getVal(key);
      if (redisData !== code || !redisData) {
        throw new CustomError(
          '验证码错误或已过期！',
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      // 用户表创建用户
      const createUserRes = await userService.create({
        username: `用户${randomNumber(8)}`,
        password: getRandomString(8),
      });
      // 邮箱表创建邮箱
      const emailData: any = await emailUserService.create({ email });
      // 第三方用户表绑定用户和邮箱
      await thirdUserService.create({
        user_id: createUserRes.id,
        third_user_id: emailData.id,
        third_platform: THIRD_PLATFORM.email,
      });
      const token = signJwt({
        userInfo: createUserRes,
        exp,
      });
      await userService.update({ token, id: createUserRes.id }); // 每次登录都更新token
      await redisController.del(key);
      successHandler({ ctx, data: token, message: '注册成功！' });
    }

    await next();
  };

  /** 发送登录验证码 */
  sendLoginCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.emailLogin,
        key: email,
      },
      desc: '登录博客',
    });
    if (result !== VERIFY_EMAIL_RESULT_CODE.ok) {
      throw new CustomError(
        result,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送注册验证码 */
  sendRegisterCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.emailRegister,
        key: email,
      },
      desc: '注册用户',
    });
    if (result !== VERIFY_EMAIL_RESULT_CODE.ok) {
      throw new CustomError(
        result,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送绑定邮箱验证码 */
  sendBindEmailCode = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: `${REDIS_PREFIX.userBindEmail}-${userInfo!.id!}`,
        key: email,
      },
      desc: '绑定邮箱',
    });
    if (result !== VERIFY_EMAIL_RESULT_CODE.ok) {
      throw new CustomError(
        result,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送取消绑定邮箱验证码 */
  sendCancelBindEmailCode = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const { email } = ctx.request.body;
    const key = {
      prefix: `${REDIS_PREFIX.userCancelBindEmail}-${userInfo!.id!}`,
      key: email,
    };
    const result = await this.sendCode({
      key,
      desc: '取消绑定邮箱',
    });
    if (result !== VERIFY_EMAIL_RESULT_CODE.ok) {
      throw new CustomError(
        result,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, message: result });
    await next();
  };

  /** 获取邮箱列表 */
  async getList(ctx: ParameterizedContext, next) {
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
    }: IList<IEmailUser> = ctx.request.query;
    const result = await emailUserService.getList({
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
  }

  /**
   * 用户绑定邮箱。
   * 1，先判断third_user表里面自己有没有绑定过邮箱，如果自己绑定过邮箱，就不能再绑定了（只能解绑）。
   * 2，再判断third_user表里面有没有其他人绑定过该邮箱，如果这个邮箱被别人绑定了，就不能绑定了。
   * 3，符合绑定邮箱条件，再验证验证码，最后绑定。
   */
  bindEmail = async (ctx: ParameterizedContext, next) => {
    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (authCode !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, authCode, authCode);
    }
    const { email, code } = ctx.request.body;
    if (!code) {
      throw new CustomError(
        '验证码不能为空！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result: any[] = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.email
    );
    if (ownIsBind.length) {
      throw new CustomError(
        '你已经绑定过邮箱，请先解绑原邮箱！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const otherIsBind = await emailUserService.findByEmail(email);
    if (otherIsBind) {
      throw new CustomError(
        '该邮箱已被其他人绑定！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const key = {
      prefix: `${REDIS_PREFIX.userBindEmail}-${userInfo!.id!}`,
      key: email,
    };
    const redisData = await redisController.getVal({
      ...key,
    });
    if (redisData !== code || !redisData) {
      throw new CustomError(
        VERIFY_EMAIL_RESULT_CODE.err,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const createEmailRes: any = await emailUserService.create({ email });
    await thirdUserService.create({
      user_id: userInfo!.id,
      third_platform: THIRD_PLATFORM.email,
      third_user_id: createEmailRes.id,
    });
    await redisController.del(key);
    successHandler({ ctx, message: '绑定邮箱成功！' });

    await next();
  };

  /**
   * 用户取消绑定邮箱。
   * 1，先判断third_user表里面自己有没有绑定过邮箱，如果自己没有绑定过邮箱，就不能取消绑定。
   * 2，符合取消绑定邮箱条件，再验证验证码，最后绑定。
   */
  cancelBindEmail = async (ctx: ParameterizedContext, next) => {
    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (!userInfo) {
      throw new CustomError(message, authCode, authCode);
    }
    const { code } = ctx.request.body;
    if (!code) {
      throw new CustomError(
        '验证码不能为空！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result: any[] = await thirdUserService.findByUserId(userInfo.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.email
    );
    if (!ownIsBind.length) {
      throw new CustomError(
        '你没有绑定过邮箱，不能解绑！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const userEmail: any = await emailUserService.findById(
      ownIsBind[0].third_user_id
    );
    const key = {
      prefix: `${REDIS_PREFIX.userCancelBindEmail}-${userInfo.id!}`,
      key: userEmail.email,
    };
    const redisData = await redisController.getVal({
      ...key,
    });
    if (redisData !== code || !redisData) {
      throw new CustomError(
        VERIFY_EMAIL_RESULT_CODE.err,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    // 至少得绑定一个第三方平台，否则不能解绑
    const user = await userService.findAccount(userInfo.id!);
    if (
      Number(user?.github_users!.length) + Number(user?.qq_users!.length) ===
      0
    ) {
      throw new CustomError(
        '不能解绑，至少得绑定一个第三方平台（github、email、qq）！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await emailUserService.delete(ownIsBind[0].third_user_id);
    await thirdUserService.delete(ownIsBind[0].id);
    await redisController.del(key);

    successHandler({ ctx, message: '解绑邮箱成功！' });

    await next();
  };
}

export default new EmailUserController();
