import { filterObj } from 'billd-utils';
import jwt from 'jsonwebtoken';

import { COMMON_ERROE_MSG, COMMON_HTTP_CODE } from '@/constant';
import { JWT_SECRET } from '@/secret/secret';
import userService from '@/service/user.service';
import { IUser, UserStatusEnum } from '@/types/IUser';
import { judgeUserStatus } from '@/utils';

/**
 * 验证jwt
 */
export const jwtVerify = (token: string) => {
  return new Promise<{
    code: number;
    errorCode?: number;
    msg: string;
    userInfo?: IUser;
  }>((resolve) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      // 判断非法/过期token
      if (err) {
        let msg = err.message;
        if (err.message.indexOf('expired') !== -1) {
          msg = COMMON_ERROE_MSG.jwtExpired;
        }
        if (err.message.indexOf('invalid') !== -1) {
          msg = COMMON_ERROE_MSG.invalidToken;
        }
        resolve({ code: COMMON_HTTP_CODE.unauthorized, msg });
        return;
      }
      async function main() {
        try {
          const userResult = await userService.findAndToken(
            // @ts-ignore
            decoded.userInfo.id
          );
          if (!userResult) {
            // 这个用户已经被删除了
            resolve({
              code: COMMON_HTTP_CODE.unauthorized,
              msg: '该用户不存在！',
            });
            return;
          }
          if (userResult.token !== token) {
            // 1.防止修改密码后，原本的token还能用
            // 2.重新登录问题，重新登录会更新token（这个待优化，应该是异地重新登陆了才更新token）
            resolve({
              code: COMMON_HTTP_CODE.unauthorized,
              msg: COMMON_ERROE_MSG.jwtExpired,
            });
            return;
          }
          const userStatusRes = judgeUserStatus(userResult.status!);
          if (userStatusRes.status !== UserStatusEnum.normal) {
            // 判断用户状态
            resolve({
              code: COMMON_HTTP_CODE.unauthorized,
              errorCode: userStatusRes.errorCode,
              msg: userStatusRes.msg,
            });
            return;
          }
          resolve({
            code: COMMON_HTTP_CODE.success,
            msg: '验证token通过！',
            userInfo: filterObj(userResult.get(), ['token']),
          });
        } catch (error: any) {
          resolve({ code: COMMON_HTTP_CODE.paramsError, msg: error });
        }
      }
      // 如果token正确，解密token获取用户id，根据id查数据库的token判断是否一致。
      main();
    });
  });
};

/**
 * 自动验证jwt
 */
export const authJwt = async (ctx) => {
  // 首先判断请求头有没有authorization
  if (ctx.req.headers.authorization === undefined) {
    return { code: COMMON_HTTP_CODE.unauthorized, msg: '未登录！' };
  }

  const token = ctx.req.headers.authorization?.split(' ')[1];
  const res = await jwtVerify(token);
  return res;
};

/**
 * 生成jwt，exp单位：小时
 */
export const signJwt = (value: { userInfo: IUser; exp: number }): string => {
  const userInfo = {
    id: value.userInfo.id,
    username: value.userInfo.username,
    avatar: value.userInfo.avatar,
  };
  const res = jwt.sign(
    { userInfo, exp: Math.floor(Date.now() / 1000) + 60 * 60 * value.exp },
    JWT_SECRET
  );
  return res;
};
