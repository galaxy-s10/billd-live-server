import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  COMMON_HTTP_CODE,
  DEFAULT_ROLE_INFO,
  MAX_TOKEN_EXP,
  REDIS_PREFIX,
  THIRD_PLATFORM,
} from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserModel from '@/model/thirdUser.model';
import { WECHAT_SECRET } from '@/secret/secret';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import walletService from '@/service/wallet.service';
import wechatUserService from '@/service/wechatUser.service';
import { WECHAT_GZH_APPID } from '@/spec-config';
import { IWechatUser } from '@/types/IUser';
import { strSlice } from '@/utils';
import { myaxios } from '@/utils/request';

interface IAccessTokenOk {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  is_snapshotuser: number;
  unionid: string;
}
interface IWechatErr {
  errcode: number;
  errmsg: string;
}

export interface IGetUserInfoOk {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string;
  unionid: string;
}

class WechatUserController {
  async create(ctx: ParameterizedContext, next) {
    const {
      appid,
      openid,
      nickname,
      sex,
      province,
      city,
      country,
      headimgurl,
      privilege,
      unionid,
    }: IWechatUser = ctx.request.body;
    const result = await wechatUserService.create({
      appid,
      openid,
      nickname,
      sex,
      province,
      city,
      country,
      headimgurl,
      privilege,
      unionid,
    });
    successHandler({ ctx, data: result });
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */

    await next();
  }

  /**
   * 通过code换取网页授权access_token
   * 正确时返回的JSON数据包如下：
   * {
  "access_token":"ACCESS_TOKEN",
  "expires_in":7200,
  "refresh_token":"REFRESH_TOKEN",
  "openid":"OPENID",
  "scope":"SCOPE",
  "is_snapshotuser": 1,
  "unionid": "UNIONID"
}
错误时微信会返回JSON数据包如下（示例为Code无效错误）:
{"errcode":40029,"errmsg":"invalid code"}
   */
  async getAccessToken(code) {
    const params = {
      code,
      appid: WECHAT_GZH_APPID,
      secret: WECHAT_SECRET,
      grant_type: 'authorization_code',
    };
    // https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
    const accessToken: IAccessTokenOk & IWechatErr = await myaxios.get(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
      {
        headers: { Accept: 'application/json' },
        params: { ...params },
      }
    );
    return accessToken;
  }

  /**
   * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#3
   * 正确时返回的JSON数据包如下
   * {
  "openid": "OPENID",
  "nickname": NICKNAME,
  "sex": 1,
  "province":"PROVINCE",
  "city":"CITY",
  "country":"COUNTRY",
  "headimgurl":"https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
  "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
  "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
错误时微信会返回JSON数据包如下（示例为openid无效）:
{"errcode":40003,"errmsg":" invalid openid "}
   */
  async getUserInfo({ access_token, openid }) {
    const UserInfo: IGetUserInfoOk & IWechatErr = await myaxios.get(
      'https://api.weixin.qq.com/sns/userinfo',
      {
        headers: { Accept: 'application/json' },
        params: { access_token, openid, lang: 'zh_CN' },
      }
    );
    return UserInfo;
  }

  login = async (ctx: ParameterizedContext, next) => {
    const loginBody = ctx.request.body; // 注意此code会在10分钟内过期。
    const {
      code,
      platform,
      login_id,
    }: { code: string; platform: string; login_id: string } = loginBody;
    if (!THIRD_PLATFORM[platform]) {
      throw new CustomError(
        'platform错误！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    let { exp } = ctx.request.body;
    if (!exp) {
      exp = 24;
    } else if (exp > MAX_TOKEN_EXP) {
      exp = MAX_TOKEN_EXP;
    }
    const accessToken = await this.getAccessToken(code);
    if (accessToken.errcode) {
      throw new CustomError(
        JSON.stringify(accessToken),
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    console.log('getAccessToken成功');
    console.log(accessToken);
    const wxUserInfo = await this.getUserInfo({
      access_token: accessToken.access_token,
      openid: accessToken.openid,
    });
    if (wxUserInfo.errcode) {
      throw new CustomError(
        `wechat登录getUserInfo错误`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    console.log('wechat登录getUserInfo成功');
    console.log(wxUserInfo);
    const wechatUserInfo = {
      appid: WECHAT_GZH_APPID,
      city: wxUserInfo.city,
      country: wxUserInfo.country,
      headimgurl: wxUserInfo.headimgurl,
      nickname: wxUserInfo.nickname,
      openid: wxUserInfo.openid,
      privilege: JSON.stringify(wxUserInfo.privilege),
      province: wxUserInfo.province,
      sex: wxUserInfo.sex,
      unionid: wxUserInfo.unionid,
    };
    const isExist = await wechatUserService.isExistOpenid(
      wechatUserInfo.openid
    );
    if (!isExist) {
      console.log('不存在wechat账号');
      const wechatUser = await wechatUserService.create(wechatUserInfo);
      const userInfo = await userService.create({
        username: wechatUserInfo.nickname,
        password: getRandomString(8),
        avatar: wechatUserInfo.headimgurl,
      });
      // @ts-ignore
      await userInfo.setRoles([DEFAULT_ROLE_INFO.VIP_USER.id]);
      await walletService.create({ user_id: userInfo.id, balance: 0 });
      await thirdUserModel.create({
        user_id: userInfo.id,
        third_user_id: wechatUser.id,
        third_platform: THIRD_PLATFORM.wechat,
      });
      const token = signJwt({
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          avatar: userInfo.avatar,
        },
        exp,
      });
      await userService.update({
        id: userInfo?.id,
        token,
      });
      if (ctx.header.origin?.indexOf('localhost') !== -1) {
        console.log('不存在wechat账号，localhost设置cookie', token);
      } else {
        console.log('不存在wechat账号，非localhost设置cookie', token);
      }

      const createDate = {
        login_id,
        exp,
        platform,
        isLogin: true,
        token,
      };
      const redisExp = 10;
      const client_ip = strSlice(
        String(ctx.request.headers['x-real-ip'] || ''),
        100
      );
      await redisController.setExVal({
        prefix: REDIS_PREFIX.qrCodeLogin,
        key: `${platform}___${login_id}`,
        exp: redisExp,
        value: createDate,
        client_ip,
      });
      successHandler({ ctx, data: token, msg: 'wechat登录成功！' });
    } else {
      console.log('已存在wechat账号');
      await wechatUserService.update(wechatUserInfo);
      const oldWechatUser = await wechatUserService.findByOpenid(
        wechatUserInfo.openid
      );
      if (!oldWechatUser) {
        throw new CustomError(
          `wechat登录oldWechatUser错误`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const thirdUserInfo = await thirdUserService.findUser({
        third_platform: THIRD_PLATFORM.wechat,
        third_user_id: oldWechatUser.id,
      });
      if (!thirdUserInfo) {
        throw new CustomError(
          `wechat登录thirdUserInfo错误`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const userInfo = await userService.find(thirdUserInfo.user_id!);
      if (!userInfo) {
        throw new CustomError(
          `wechat登录userInfo错误`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const token = signJwt({
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          avatar: userInfo.avatar,
        },
        exp,
      });
      await userService.update({
        id: userInfo.id,
        token,
      });
      if (ctx.header.origin?.indexOf('localhost') !== -1) {
        console.log('已存在wechat账号，localhost设置cookie', token);
      } else {
        console.log('已存在wechat账号，非localhost设置cookie', token);
      }
      const createDate = {
        login_id,
        exp,
        platform,
        isLogin: true,
        token,
      };
      const redisExp = 10;
      const client_ip = strSlice(
        String(ctx.request.headers['x-real-ip'] || ''),
        100
      );
      await redisController.setExVal({
        prefix: REDIS_PREFIX.qrCodeLogin,
        key: `${platform}___${login_id}`,
        exp: redisExp,
        value: createDate,
        client_ip,
      });
      successHandler({ ctx, data: token, msg: 'wechat登录成功！' });
    }

    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  async list(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      nickname,
      created_at,
      updated_at,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWechatUser> = ctx.request.query;
    const result = await wechatUserService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      nickname,
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
    const result = await wechatUserService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const {
      appid,
      openid,
      nickname,
      sex,
      province,
      city,
      country,
      headimgurl,
      privilege,
      unionid,
    }: IWechatUser = ctx.request.body;
    const result = await wechatUserService.update({
      appid,
      openid,
      nickname,
      sex,
      province,
      city,
      country,
      headimgurl,
      privilege,
      unionid,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await wechatUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的wechat用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await wechatUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new WechatUserController();
