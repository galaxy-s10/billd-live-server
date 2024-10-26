import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import deskConfigController from '@/controller/deskConfig.controller';
import { DeskConfigEnum, IDeskVersion } from '@/interface';
import { CustomError } from '@/model/customError.model';
import deskVersionService from '@/service/deskVersion.service';
import { compareVersions } from '@/utils';

class DeskUserController {
  common = {
    getList: ({
      id,
      version,
      disable,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }) => {
      return deskVersionService.getList({
        id,
        version,
        disable,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
    },
    findByVersion: (version: string) =>
      deskVersionService.findByVersion(version),
  };

  /**
   * 可以这样设计：前端本地存有一个版本号，localVersion
   * 1.前端先判断checkUpdate，checkUpdate等于1才提示更新，否则直接不提示更新
   * 2.判断forceUpdateList，如果localVersion在forceUpdateList里面，就强制更新到最新版本
   * 3.判断newVersion，
   *    3.1如果localVersion小于newVersion，则判断localVersion是否小于minVersion，如果localVersion小于minVersion，则代表有版本更新，且是强制更新。
   *    3.2如果localVersion不小于newVersion，则代表当前是最新版本，不用更新
   */
  check = async (ctx: ParameterizedContext, next) => {
    const { version: localVersion }: any = ctx.request.query;
    if (!localVersion) {
      throw new CustomError(
        `版本号错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await deskConfigController.common.findByType(
      DeskConfigEnum.versionConfig
    );
    // 是否检查更新，1:检查更新; 2:不检查更新
    let checkUpdate = 2;
    // 是否提示更新，1:提示; 2:不提示
    let isUpdate = 2;
    // 是否强制更新，1:强制; 2:不强制
    let forceUpdate = 2;
    const versionConfig = res[0];
    if (versionConfig) {
      const minVersion = String(versionConfig.field_a);
      const newVersion = String(versionConfig.field_b);
      checkUpdate = Number(versionConfig.field_c);
      // @ts-ignore
      const list = await this.common.getList({});
      const localVersionInfo = list.rows.find(
        (v: any) => v.version === localVersion
      ) as IDeskVersion | undefined;
      const newVersionInfo = list.rows.find(
        (v: any) => v.version === newVersion
      ) as IDeskVersion | undefined;
      if (compareVersions(localVersion, newVersion) === 2) {
        isUpdate = 1;
        if (compareVersions(localVersion, minVersion) === 2) {
          forceUpdate = 1;
        } else {
          forceUpdate = 2;
        }
      } else {
        isUpdate = 2;
      }

      // 如果这个版本配置了强制更新，则设置forceUpdate = 1
      if (localVersionInfo?.force === 1) {
        forceUpdate = 1;
      }

      // 如果最新版本没有信息，则不能更新
      if (!newVersionInfo) {
        isUpdate = 2;
      }

      successHandler({
        ctx,
        data: {
          version: newVersionInfo?.version,
          show_version: newVersionInfo?.show_version,
          checkUpdate,
          isUpdate,
          forceUpdate,
          updateContent: newVersionInfo?.update_content,
          updateDate: newVersionInfo?.update_date,
          download: {
            macos_dmg: newVersionInfo?.download_macos_dmg,
            window_64_exe: newVersionInfo?.download_windows_64_exe,
            window_32_exe: newVersionInfo?.download_windows_32_exe,
            window_arm_exe: newVersionInfo?.download_windows_arm_exe,
            linux_64_deb: newVersionInfo?.download_linux_64_deb,
            linux_64_tar: newVersionInfo?.download_linux_64_tar,
            linux_arm_deb: newVersionInfo?.download_linux_arm_deb,
            linux_arm_tar: newVersionInfo?.download_linux_arm_tar,
          },
          disableList:
            localVersionInfo?.disable === 1
              ? [
                  {
                    version: localVersion,
                    msg: localVersionInfo?.disable_msg,
                  },
                ]
              : [],
          remark: newVersionInfo?.remark,
        },
      });
      await next();
    } else {
      throw new CustomError(
        `找不到版本配置信息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
  };

  latest = async (ctx: ParameterizedContext, next) => {
    const cfgRes = await deskConfigController.common.findByType(
      DeskConfigEnum.versionConfig
    );
    const versionConfig = cfgRes[0];
    let res;
    if (versionConfig) {
      const newVersion = String(versionConfig.field_b);
      res = await this.common.findByVersion(newVersion);
    }
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  async findByVersion(ctx: ParameterizedContext, next) {
    const { version }: any = ctx.request.query;
    const res = await deskVersionService.findByVersion(version);
    successHandler({ ctx, data: res });
    await next();
  }
}
export default new DeskUserController();
