import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  LIVE_QQ_CLIENT_ID,
  LIVE_QQ_CLIENT_SECRET,
  LIVE_QQ_REDIRECT_URI,
} from '@/config/secret';
import { ALLOW_HTTP_CODE, THIRD_PLATFORM } from '@/constant';
import { IList, IQqUser } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserModel from '@/model/thirdUser.model';
import qqUserService from '@/service/qqUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import axios from '@/utils/request';

// WARN 有时候qq登录的回调会是这样的：https://admin.hsslive.cn/oauth/qq_login?error=100070&error_description=the+account+has+security+exception&state=99
// WARN 即qq那边的回调错误，导致这个的原因可能是科学上网，关掉科学上网或者换个节点应该就能解决。

// WARN 目前的流程是qq授权成功后，postmessage给本地的页面发通知
// 然后本地发起请求，如果本地调用线上的https接口，Set-Cookie会不生效（因为子域名、主域名都不一样，
// 本地是localhost，而线上是hsslive.cn），虽然Set-Cookie不生效，但是仍然会返回token，因此
// 上层的应用（也就是前后台的页面）可以使用返回的token，不使用cookie
// 如果是线上环境，就没有这个问题，因为主域名一样，只是子域名不一样。

class QqUserController {
  async create(ctx: ParameterizedContext, next) {
    const {
      client_id,
      openid,
      unionid,
      nickname,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      constellation,
      gender,
      city,
      province,
      year,
    }: IQqUser = ctx.request.body;
    const result = await qqUserService.create({
      client_id,
      openid,
      unionid,
      nickname,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      constellation,
      gender,
      city,
      province,
      year,
    });
    successHandler({ ctx, data: result });
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */

    await next();
  }

  async getAccessToken(code) {
    // 注意此code会在10分钟内过期。
    const params: any = {};
    params.code = code;
    params.client_id = LIVE_QQ_CLIENT_ID;
    params.client_secret = LIVE_QQ_CLIENT_SECRET;
    params.redirect_uri = LIVE_QQ_REDIRECT_URI;
    params.grant_type = 'authorization_code';
    params.fmt = 'json';
    // https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    const accessToken: any = await axios.get(
      'https://graph.qq.com/oauth2.0/token',
      {
        headers: { Accept: 'application/json' },
        params: { ...params },
      }
    );
    return accessToken;
  }

  /**
   * https://wiki.connect.qq.com/get_user_info
   * ret	返回码
   * msg	如果ret<0，会有相应的错误信息提示，返回数据全部用UTF-8编码。
   * nickname	用户在QQ空间的昵称。
   * figureurl	大小为30×30像素的QQ空间头像URL。
   * figureurl_1	大小为50×50像素的QQ空间头像URL。
   * figureurl_2	大小为100×100像素的QQ空间头像URL。
   * figureurl_qq_1	大小为40×40像素的QQ头像URL。
   * figureurl_qq_2	大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有。
   * gender	性别。 如果获取不到则默认返回"男"
   */
  async getUserInfo({ access_token, oauth_consumer_key, openid }) {
    const UserInfo: any = await axios.get(
      'https://graph.qq.com/user/get_user_info',
      {
        headers: { Accept: 'application/json' },
        params: { access_token, oauth_consumer_key, openid },
      }
    );
    return UserInfo;
  }

  /**
   * 获取用户OpenID_OAuth2.0，即获取openid和unionid
   * 此接口用于获取个人信息。开发者可通过openID来获取用户的基本信息。
   * 特别需要注意的是，如果开发者拥有多个移动应用、网站应用，
   * 可通过获取用户的unionID来区分用户的唯一性，
   * 因为只要是同一QQ互联平台下的不同应用，unionID是相同的。
   * 换句话说，同一用户，对同一个QQ互联平台下的不同应用，unionID是相同的。
   * https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
   * https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
   */
  async getMeOauth({ access_token, unionid, fmt }) {
    const OauthInfo: any = await axios.get('https://graph.qq.com/oauth2.0/me', {
      headers: { Accept: 'application/json' },
      params: { access_token, unionid, fmt },
    });
    return OauthInfo;
  }

  login = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    const exp = 24; // token过期时间：24小时
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    const OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
      unionid: 1,
      fmt: 'json',
    });
    const getUserInfoRes: IQqUser = await this.getUserInfo({
      access_token: accessToken.access_token,
      oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
      openid: OauthInfo.openid,
    });
    const qqUserInfo = {
      ...getUserInfoRes,
      client_id: OauthInfo.client_id,
      unionid: OauthInfo.unionid,
      openid: OauthInfo.openid,
    };
    const isExist = await qqUserService.isExistUnionid(OauthInfo.unionid);
    if (!isExist) {
      const qqUser: any = await qqUserService.create(qqUserInfo);
      const userInfo: any = await userService.create({
        username: qqUserInfo.nickname,
        password: getRandomString(8),
        avatar: qqUserInfo.figureurl_2,
      });
      await thirdUserModel.create({
        user_id: userInfo?.id,
        third_user_id: qqUser.id,
        third_platform: THIRD_PLATFORM.qq,
      });
      const token = signJwt({
        userInfo: {
          ...JSON.parse(JSON.stringify(userInfo)),
          qq_users: undefined,
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
      successHandler({ ctx, data: token, message: 'qq登录成功！' });
    } else {
      await qqUserService.update(qqUserInfo);
      const oldQqUser: any = await qqUserService.findByUnionid(
        OauthInfo.unionid
      );
      const thirdUserInfo: any = await thirdUserService.findUser({
        third_platform: THIRD_PLATFORM.qq,
        third_user_id: oldQqUser.id,
      });
      const userInfo: any = await userService.findAccount(
        thirdUserInfo.user_id
      );
      const token = signJwt({
        userInfo: {
          ...JSON.parse(JSON.stringify(userInfo)),
          qq_users: undefined,
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
      successHandler({ ctx, data: token, message: 'qq登录成功！' });
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
      nickname,
      gender,
      created_at,
      updated_at,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IQqUser> = ctx.request.query;
    const result = await qqUserService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      nickname,
      gender,
      created_at,
      updated_at,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 绑定qq
   * 1，如果已经绑定过qq，则不能绑定，只能先解绑了再绑定
   * 2，如果要绑定的qq已经被别人绑定了，则不能绑定
   */
  bindQQ = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。

    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (authCode !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, authCode, authCode);
    }
    const result: any = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.qq
    );
    if (ownIsBind.length) {
      throw new CustomError(
        `你已经绑定过qq，请先解绑原qq！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    const OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
      unionid: 1,
      fmt: 'json',
    });
    const getUserInfoRes: IQqUser = await this.getUserInfo({
      access_token: accessToken.access_token,
      oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
      openid: OauthInfo.openid,
    });
    const qqUserInfo = {
      ...getUserInfoRes,
      client_id: OauthInfo.client_id,
      unionid: OauthInfo.unionid,
      openid: OauthInfo.openid,
    };
    const isExist = await qqUserService.isExistClientIdUnionid(
      OauthInfo.client_id,
      OauthInfo.unionid
    );
    if (isExist) {
      throw new CustomError(
        `该qq账号已被其他人绑定了！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const qqUser: any = await qqUserService.create(qqUserInfo);
    await thirdUserModel.create({
      user_id: userInfo?.id,
      third_user_id: qqUser.id,
      third_platform: THIRD_PLATFORM.qq,
    });
    successHandler({ ctx, message: '绑定qq成功！' });

    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await qqUserService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const {
      client_id,
      openid,
      unionid,
      nickname,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      constellation,
      gender,
      city,
      province,
      year,
    }: IQqUser = ctx.request.body;
    const result = await qqUserService.update({
      client_id,
      openid,
      unionid,
      nickname,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      constellation,
      gender,
      city,
      province,
      year,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await qqUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的qq用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await qqUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new QqUserController();
