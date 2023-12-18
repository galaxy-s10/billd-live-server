import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '@/config/secret';
import { ALLOW_HTTP_CODE, COMMON_ERR_MSG } from '@/constant';
import { IUser, UserStatusEnum } from '@/interface';
import userService from '@/service/user.service';

/**
 * 验证jwt
 */
export const jwtVerify = (token: string) => {
  return new Promise<{ code: number; message: string; userInfo?: IUser }>(
    (resolve) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        // 判断非法/过期token
        if (err) {
          let { message } = err;
          if (err.message.indexOf('expired') !== -1) {
            message = COMMON_ERR_MSG.jwtExpired;
          }
          if (err.message.indexOf('invalid') !== -1) {
            message = COMMON_ERR_MSG.invalidToken;
          }
          resolve({ code: ALLOW_HTTP_CODE.unauthorized, message });
          return;
        }
        async function main() {
          try {
            const userResult = await userService.findAndToken(
              decoded.userInfo.id
            );
            if (!userResult) {
              // 这个用户已经被删除了
              resolve({
                code: ALLOW_HTTP_CODE.unauthorized,
                message: '该用户不存在！',
              });
              return;
            }
            if (userResult.token !== token) {
              // 异地登录（防止修改密码后，原本的token还能用）
              resolve({
                code: ALLOW_HTTP_CODE.unauthorized,
                message: COMMON_ERR_MSG.jwtExpired,
              });
              return;
            }
            if (userResult.status === UserStatusEnum.disable) {
              // 账号被禁用了
              resolve({
                code: ALLOW_HTTP_CODE.unauthorized,
                message: COMMON_ERR_MSG.adminDisableUser,
              });
              return;
            }
            resolve({
              code: ALLOW_HTTP_CODE.ok,
              message: '验证token通过！',
              userInfo: userResult,
            });
          } catch (error: any) {
            resolve({ code: ALLOW_HTTP_CODE.paramsError, message: error });
          }
        }
        // 如果token正确，解密token获取用户id，根据id查数据库的token判断是否一致。
        main();
      });
    }
  );
};

/**
 * 自动验证jwt
 */
export const authJwt = async (ctx) => {
  // 首先判断请求头有没有authorization
  if (ctx.req.headers.authorization === undefined) {
    return { code: ALLOW_HTTP_CODE.unauthorized, message: '未登录！' };
  }

  const token = ctx.req.headers.authorization?.split(' ')[1];
  const res = await jwtVerify(token);
  return res;
};

/**
 * 生成jwt
 */
export const signJwt = (value: { userInfo: any; exp: number }): string => {
  const res = jwt.sign(
    { ...value, exp: Math.floor(Date.now() / 1000) + 60 * 60 * value.exp },
    JWT_SECRET
  );
  return res;
};
