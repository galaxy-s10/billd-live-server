import { exec } from 'child_process';

import { logData } from 'billd-html-webpack-plugin';
import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, PROJECT_ENV, PROJECT_NAME } from '@/constant';
import { CustomError } from '@/model/customError.model';
import { TENCENTCLOUD_COS } from '@/spec-config';
import { chalkERROR, chalkINFO } from '@/utils/chalkTip';
import { getPolicyByRes } from '@/utils/tencentcloud-cos';

function execCmd({ key, cmd }: { key: string; cmd: string }) {
  return new Promise<{ key; res }>((resolve) => {
    exec(
      cmd,
      {
        cwd: process.cwd(),
      },
      (error, stdout, stderr) => {
        if (error) {
          // nginx -v时,error是null,stderr是nginx version: nginx/1.23.3
          // if (error || stderr) {
          console.log(chalkERROR(`执行${cmd}出错`));
          console.log('error', error);
          console.log('stdout', stdout);
          console.log('stderr', stderr);
          resolve({
            key,
            res: String(error || stderr)
              .toString()
              .trim(),
          });
        }
        if (stdout || stderr) {
          console.log(chalkINFO(`执行${cmd}成功`));
          console.log('error', error);
          console.log('stdout', stdout);
          console.log('stderr', stderr);
          resolve({ key, res: (stdout || stderr).toString().trim() });
        }
      }
    );
  });
}

const cmdMap = {
  uname: 'uname -a', // 系统信息
  redisVersion: 'redis-server -v', // redis版本
  mysqlVersion: 'mysql -V', // mysql版本
  nginxVersion: 'nginx -v', // nginx版本
  dockerVersion: 'docker -v', // docker版本
  pm2Version: 'pm2 -v', // pm2版本
  nodeVersion: 'node -v', // node版本
  npmVersion: 'npm -v', // npm版本
  pnpmVersion: 'pnpm -v', // pnpm版本
};

class OtherController {
  async getClientIp(ctx: ParameterizedContext, next) {
    const client_ip = ctx?.request?.headers?.['x-real-ip'] || '';

    successHandler({
      ctx,
      data: {
        client_ip,
      },
    });
    await next();
  }

  getServerInfo = async (ctx: ParameterizedContext, next) => {
    successHandler({
      ctx,
      data: {},
    });
    const server: Record<string, string> = {};
    const cmdArr: Promise<{ key; res }>[] = [];
    Object.keys(cmdMap).forEach((key) => {
      try {
        cmdArr.push(execCmd({ key, cmd: cmdMap[key] }));
      } catch (error) {
        console.log(error);
      }
    });
    try {
      const serverInfo = await Promise.all(cmdArr);
      Object.keys(serverInfo).forEach((index) => {
        const item = serverInfo[+index];
        server[item.key] = item.res;
      });
    } catch (error) {
      console.log(error);
    }
    successHandler({
      ctx,
      data: {
        project_name: PROJECT_NAME,
        project_env: PROJECT_ENV,
        updated_at: new Date().toLocaleString(),
        server,
        billd: logData(),
      },
    });
    await next();
  };

  async getPolicyByRes(ctx: ParameterizedContext, next) {
    // @ts-ignore
    const { prefix }: { prefix: string } = ctx.request.query;
    if (!TENCENTCLOUD_COS['res-1305322458'].prefix[prefix]) {
      throw new CustomError(
        `非法prefix！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await getPolicyByRes({ prefix });
    successHandler({
      ctx,
      data: res,
    });
    await next();
  }
}

export default new OtherController();
