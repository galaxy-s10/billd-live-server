import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
} from '@/config/secret';
import { ALLOW_HTTP_CODE, PROJECT_ENV, THIRD_PLATFORM } from '@/constant';
import { IGithubUser, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserModel from '@/model/thirdUser.model';
import githubUserService from '@/service/githubUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { getRandomString } from '@/utils';
import axios from '@/utils/request';

class GithubUserController {
  async create(ctx: ParameterizedContext, next) {
    const githubProps: IGithubUser = ctx.request.body;
    const result = await githubUserService.create(githubProps);
    successHandler({ ctx, data: result });
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */

    await next();
  }

  async getAccessToken(code) {
    const params: any = {};
    params.code = code;
    params.client_id = GITHUB_CLIENT_ID;
    params.client_secret = GITHUB_CLIENT_SECRET;
    params.redirect_uri = GITHUB_REDIRECT_URI;
    const accessToken: any = await axios.get(
      'https://github.com/login/oauth/access_token',
      {
        headers: { Accept: 'application/json' },
        params: { ...params },
      }
    );
    return accessToken;
  }

  /** https://docs.github.com/cn/rest/reference/users#get-the-authenticated-user */
  async getMeOauth({ access_token }: { access_token: string }) {
    const OauthInfo: any = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });
    return OauthInfo;
  }

  /** https://docs.github.com/cn/rest/reference/users#get-the-authenticated-user */
  getRepoStargazers = async (ctx: ParameterizedContext, next) => {
    // getRepoStargazers = async ({ repo }: { repo: string }) => {
    const { repo }: { repo: string } = ctx.request.query;
    const accessToken = '666';
    const data: any = await axios.get(
      `https://api.github.com/repos/galaxy-s10/${repo}/stargazers?per_page=50`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.star+json',
          Authorization: `token ${accessToken}`,
        },
      }
    );
    // console.log(data);
    successHandler({
      ctx,
      data: {
        data,
        len: data.length,
      },
      message: '绑定github成功！',
    });
  };

  /**
   * 绑定github
   * 1，如果已经绑定过github，则不能绑定，只能先解绑了再绑定
   * 2，如果要绑定的github已经被别人绑定了，则不能绑定
   */
  bindGithub = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (authCode !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, authCode, authCode);
    }
    const result: any = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.github
    );
    if (ownIsBind.length) {
      throw new CustomError(
        '你已经绑定过github，请先解绑原github！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    let OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
    });
    const isExist = await githubUserService.isExist([OauthInfo.id]);

    OauthInfo = {
      ...OauthInfo,
      github_id: OauthInfo.id,
      github_created_at: OauthInfo.created_at,
      github_updated_at: OauthInfo.updated_at,
    };
    delete OauthInfo.id;
    delete OauthInfo.created_at;
    delete OauthInfo.updated_at;
    if (isExist) {
      throw new CustomError(
        '该github账号已被其他人绑定了！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const githubUser: any = await githubUserService.create({
      ...OauthInfo,
      client_id: GITHUB_CLIENT_ID,
    });
    await thirdUserModel.create({
      user_id: userInfo!.id,
      third_user_id: githubUser.id,
      third_platform: THIRD_PLATFORM.github,
    });
    successHandler({ ctx, message: '绑定github成功！' });

    await next();
  };

  /**
   * 取消绑定github
   */
  cancelBindGithub = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (!userInfo) {
      throw new CustomError(message, code, code);
    }
    const result: any[] = await thirdUserService.findByUserId(userInfo.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.github
    );
    if (!ownIsBind.length) {
      throw new CustomError(
        '你没有绑定过github，不能解绑！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    // 至少得绑定一个第三方平台，否则不能解绑
    const user = await userService.findAccount(userInfo.id!);
    if (
      Number(user?.qq_users!.length) + Number(user?.email_users!.length) ===
      0
    ) {
      throw new CustomError(
        '不能解绑，至少得绑定一个第三方平台（github、email、qq）！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await githubUserService.delete(ownIsBind[0].third_user_id);
    await thirdUserService.delete(ownIsBind[0].id);
    successHandler({ ctx, message: '解绑github成功！' });

    await next();
  };

  /**
   * github登录
   */
  login = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    const exp = 24; // token过期时间：24小时
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    let OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
    });
    const isExist = await githubUserService.isExist([OauthInfo.id]);
    OauthInfo = {
      ...OauthInfo,
      github_id: OauthInfo.id,
      github_created_at: OauthInfo.created_at,
      github_updated_at: OauthInfo.updated_at,
    };
    delete OauthInfo.id;
    delete OauthInfo.created_at;
    delete OauthInfo.updated_at;
    if (!isExist) {
      const githubUser: any = await githubUserService.create({
        ...OauthInfo,
        client_id: GITHUB_CLIENT_ID,
      });
      const userInfo: any = await userService.create({
        username: OauthInfo.login,
        password: getRandomString(8),
        avatar: OauthInfo.avatar_url,
        desc: OauthInfo.bio,
      });
      await thirdUserModel.create({
        user_id: userInfo?.id,
        third_user_id: githubUser.id,
        third_platform: THIRD_PLATFORM.github,
      });
      const token = signJwt({
        userInfo: {
          ...JSON.parse(JSON.stringify(userInfo)),
          github_users: undefined,
          qq_users: undefined,
          email_users: undefined,
        },
        exp,
      });
      await userService.update({
        id: userInfo?.id,
        token,
      });
      if (ctx.header.origin?.indexOf('localhost') !== -1) {
        ctx.cookies.set('token', token, {
          httpOnly: false, // 设置httpOnly为true后，document.cookie就拿不到key为token的cookie了，因此设置false
          /**
           * secure
           * 一个布尔值，指示是否仅发送 cookie 通过 HTTPS（对于 HTTP，默认为 false，对于 HTTPS 默认为 true）。
           * 这里判断如果是本地开发，就设置false，因为本地是http://localhost，不是https，如果是线上，就设置
           * true，因为线上是https://admin.hsslive.cn
           */
          secure: false,
          /**
           * domain
           * 设置域名为hsslive.cn，因为接口服务部署在api.hsslive.cn，在admin.hsslive.cn请求api.hsslive.cn，默认api.hsslive.cn的Set-Cookie
           * 设置的domain是api.hsslive.cn，不会设置到admin.hsslive.cn站点下，因此手动设置domain为hsslive.cn
           */
          domain:
            ctx.header.origin?.indexOf('localhost') !== -1
              ? 'localhost'
              : 'hsslive.cn',
        });
      } else {
        ctx.cookies.set('token', token, {
          httpOnly: false, // 设置httpOnly为true后，document.cookie就拿不到key为token的cookie了，因此设置false
          sameSite: 'none', // 跨站点cookie需要设置sameSite: 'none'，设置sameSite: 'none'后，secure也要跟着设置true！
          /**
           * secure
           * 一个布尔值，指示是否仅发送 cookie 通过 HTTPS（对于 HTTP，默认为 false，对于 HTTPS 默认为 true）。
           * 这里判断如果是本地开发，就设置false，因为本地是http://localhost，不是https，如果是线上，就设置
           * true，因为线上是https://admin.hsslive.cn
           */
          secure: true,
          /**
           * domain
           * 设置域名为hsslive.cn，因为接口服务部署在api.hsslive.cn，在admin.hsslive.cn请求api.hsslive.cn，默认api.hsslive.cn的Set-Cookie
           * 设置的domain是api.hsslive.cn，不会设置到admin.hsslive.cn站点下，因此手动设置domain为hsslive.cn
           */
          domain:
            ctx.header.origin?.indexOf('localhost') !== -1
              ? 'localhost'
              : 'hsslive.cn',
        });
      }
      successHandler({ ctx, data: token, message: 'github登录成功！' });
    } else {
      await githubUserService.updateByGithubId(OauthInfo);
      const oldGithubUser: any = await githubUserService.findByGithubId(
        OauthInfo.github_id
      );
      const thirdUserInfo: any = await thirdUserService.findUser({
        third_platform: THIRD_PLATFORM.github,
        third_user_id: oldGithubUser.id,
      });
      const userInfo: any = await userService.findAccount(
        thirdUserInfo.user_id
      );
      const token = signJwt({
        userInfo: {
          ...JSON.parse(JSON.stringify(userInfo)),
          github_users: undefined,
          qq_users: undefined,
          email_users: undefined,
        },
        exp,
      });
      await userService.update({
        id: userInfo?.id,
        token,
      });
      if (ctx.header.origin?.indexOf('localhost') !== -1) {
        ctx.cookies.set('token', token, {
          httpOnly: false, // 设置httpOnly为true后，document.cookie就拿不到key为token的cookie了，因此设置false
          /**
           * secure
           * 一个布尔值，指示是否仅发送 cookie 通过 HTTPS（对于 HTTP，默认为 false，对于 HTTPS 默认为 true）。
           * 这里判断如果是本地开发，就设置false，因为本地是http://localhost，不是https，如果是线上，就设置
           * true，因为线上是https://admin.hsslive.cn
           */
          secure: false,
          /**
           * domain
           * 设置域名为hsslive.cn，因为接口服务部署在api.hsslive.cn，在admin.hsslive.cn请求api.hsslive.cn，默认api.hsslive.cn的Set-Cookie
           * 设置的domain是api.hsslive.cn，不会设置到admin.hsslive.cn站点下，因此手动设置domain为hsslive.cn
           */
          domain:
            ctx.header.origin?.indexOf('localhost') !== -1
              ? 'localhost'
              : 'hsslive.cn',
        });
      } else {
        ctx.cookies.set('token', token, {
          httpOnly: false, // 设置httpOnly为true后，document.cookie就拿不到key为token的cookie了，因此设置false
          sameSite: 'none', // 跨站点cookie需要设置sameSite: 'none'，设置sameSite: 'none'后，secure也要跟着设置true！
          /**
           * secure
           * 一个布尔值，指示是否仅发送 cookie 通过 HTTPS（对于 HTTP，默认为 false，对于 HTTPS 默认为 true）。
           * 这里判断如果是本地开发，就设置false，因为本地是http://localhost，不是https，如果是线上，就设置
           * true，因为线上是https://admin.hsslive.cn
           */
          secure: true,
          /**
           * domain
           * 设置域名为hsslive.cn，因为接口服务部署在api.hsslive.cn，在admin.hsslive.cn请求api.hsslive.cn，默认api.hsslive.cn的Set-Cookie
           * 设置的domain是api.hsslive.cn，不会设置到admin.hsslive.cn站点下，因此手动设置domain为hsslive.cn
           */
          domain:
            ctx.header.origin?.indexOf('localhost') !== -1
              ? 'localhost'
              : 'hsslive.cn',
        });
      }
      successHandler({ ctx, data: token, message: 'github登录成功！' });
    }

    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  async list(ctx: ParameterizedContext, next) {
    // @ts-ignore
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      created_at,
      updated_at,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGithubUser> = ctx.request.query;
    const result = await githubUserService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      created_at,
      updated_at,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await githubUserService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const githubProps: IGithubUser = ctx.request.body;
    const result = await githubUserService.updateByGithubId(githubProps);
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await githubUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的github用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await githubUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new GithubUserController();
