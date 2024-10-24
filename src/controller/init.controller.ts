import { getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, THIRD_PLATFORM } from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';
import srsController from '@/controller/srs.controller';
import {
  bulkCreateArea,
  bulkCreateAuth,
  bulkCreateGoods,
  bulkCreateLiveConfig,
  bulkCreateRole,
  bulkCreateRoleAuth,
  bulkCreateSettings,
} from '@/init/initData';
import { mockTimeBatchInsert } from '@/init/initDb';
import { initUser } from '@/init/initUser';
import { IInitUser } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
import authModel from '@/model/auth.model';
import { CustomError } from '@/model/customError.model';
import goodsModel from '@/model/goods.model';
import liveModel from '@/model/live.model';
import liveConfigModel from '@/model/liveConfig.model';
import liveRecordModel from '@/model/liveRecord.model';
import liveRoomModel from '@/model/liveRoom.model';
import logModel from '@/model/log.model';
import mockDayDataModel from '@/model/mockDayData.model';
import mockHourDataModel from '@/model/mockHourData.model';
import mockMinuteTenDataModel from '@/model/mockMinuteTenData.model';
import mockMinuteThirtyDataModel from '@/model/mockMinuteThirtyData.model';
import orderModel from '@/model/order.model';
import qqUserModel from '@/model/qqUser.model';
import roleModel from '@/model/role.model';
import roleAuthModel from '@/model/roleAuth.model';
import settingsModel from '@/model/settings.model';
import thirdUserModel from '@/model/thirdUser.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import userRoleModel from '@/model/userRole.model';
import walletModel from '@/model/wallet.model';
import walletRecordModel from '@/model/walletRecord.model';
import { SERVER_LIVE } from '@/secret/secret';
import liveRoomService from '@/service/liveRoom.service';
import userService from '@/service/user.service';
import walletService from '@/service/wallet.service';
import {
  ILiveRoom,
  LiveRoomIsShowEnum,
  LiveRoomStatusEnum,
  LiveRoomTypeEnum,
  LiveRoomUseCDNEnum,
} from '@/types/ILiveRoom';
import { IUser } from '@/types/IUser';
import { chalkWARN } from '@/utils/chalkTip';
import { tencentcloudUtils } from '@/utils/tencentcloud';

class InitController {
  common = {
    initDefault: async () => {
      try {
        await Promise.all([
          this.common.initGoods(),
          this.common.initDayData(365 * 3),
          this.common.initHourData(365 * 3 * 24),
          this.common.initMinuteTenData(365 * 3 * 24 * 6),
          this.common.initMinuteThirtyData(365 * 3 * 24 * 2),
          this.common.initLiveConfig(),
          this.common.initRole(),
          this.common.initAuth(),
          this.common.initRoleAuth(),
          this.common.initUserWallet(),
          this.common.initArea(),
        ]);
        await this.common.initUser();
      } catch (error) {
        console.log(chalkWARN('已初始化数据库，不能在初始化了'));
        console.log(error);
      }
    },
    initArea: async () => {
      const count = await areaModel.count();
      if (count === 0) {
        await areaModel.bulkCreate(bulkCreateArea);
      } else {
        throw new CustomError(
          '已经初始化过分区，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initLiveConfig: async () => {
      const count = await liveConfigModel.count();
      if (count === 0) {
        await liveConfigModel.bulkCreate(bulkCreateLiveConfig);
      } else {
        throw new CustomError(
          '已经初始化过直播配置，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initRole: async () => {
      const count = await roleModel.count();
      if (count === 0) {
        await roleModel.bulkCreate(bulkCreateRole);
      } else {
        throw new CustomError(
          '已经初始化过角色，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initAuth: async () => {
      const count = await authModel.count();
      if (count === 0) {
        await authModel.bulkCreate(bulkCreateAuth);
      } else {
        throw new CustomError(
          '已经初始化过权限了，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initGoods: async () => {
      const count = await goodsModel.count();
      if (count === 0) {
        await goodsModel.bulkCreate(bulkCreateGoods);
      } else {
        throw new CustomError(
          '已经初始化过商品了，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initSettings: async () => {
      const count = await settingsModel.count();
      if (count === 0) {
        await settingsModel.bulkCreate(bulkCreateSettings);
      } else {
        throw new CustomError(
          '已经初始化过设置了，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initRoleAuth: async () => {
      const count = await roleAuthModel.count();
      if (count === 0) {
        await roleAuthModel.bulkCreate(bulkCreateRoleAuth);
      } else {
        throw new CustomError(
          '已经初始化过角色权限了，不能再初始化了！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    initUser: async () => {
      const quequ: Promise<any>[] = [];
      const initOneUser = async (user: IInitUser) => {
        if (!user.id) return;
        const userIsExist = await userService.isExist([user.id]);
        let userRes;
        if (!userIsExist) {
          const userInfo = {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          };
          const exp = 24; // token过期时间：24小时
          const token = signJwt({ userInfo, exp });
          userRes = await userService.create({
            ...userInfo,
            password: getRandomString(8),
            token,
          });
          // @ts-ignore
          await userRes.setRoles(user.user_roles);
          await walletService.create({ user_id: userRes.id, balance: 0 });
          await thirdUserModel.create({
            user_id: userRes.id,
            third_user_id: userRes.id,
            third_platform: THIRD_PLATFORM.website,
          });
        } else {
          // console.log(chalkWARN(`已存在id为：${user.id}的用户！`));
          return;
        }

        if (!user.live_room?.id) return;
        const liveRoomIsExist = await liveRoomService.isExist([
          user.live_room?.id,
        ]);
        if (!liveRoomIsExist) {
          let liveUrl;
          const pushKey = cryptojs
            .MD5(`${+new Date()}___${getRandomString(6)}`)
            .toString();
          if (user.live_room.cdn === LiveRoomUseCDNEnum.no) {
            liveUrl = (live_room_id: number) => ({
              rtmp_url: `${SERVER_LIVE.PushDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}`,
              flv_url: `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.flv`,
              hls_url: `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.m3u8`,
            });
            // @ts-ignore
          } else if (user.live_room.cdn === LiveRoomUseCDNEnum.yes) {
            liveUrl = (live_room_id: number) => {
              const res = tencentcloudUtils.getPullUrl({
                liveRoomId: live_room_id,
              });
              return {
                rtmp_url: res.rtmp,
                flv_url: res.flv,
                hls_url: res.hls,
              };
            };
          }

          const { rtmp_url, flv_url, hls_url } = liveUrl(user.live_room?.id);
          const liveRoom = await liveRoomModel.create({
            id: user.live_room?.id,
            name: user.live_room?.name,
            desc: user.live_room?.desc,
            key: pushKey,
            type: LiveRoomTypeEnum.system,
            priority: user.live_room?.priority,
            cdn: user.live_room?.cdn,
            cover_img: user.live_room.cover_img,
            pull_is_should_auth: user.live_room.pull_is_should_auth,
            rtmp_url,
            flv_url,
            hls_url,
            status: LiveRoomStatusEnum.normal,
            is_show: LiveRoomIsShowEnum.yes,
          });
          // @ts-ignore
          await liveRoom.setAreas(user.live_room?.area);
          await userLiveRoomModel.create({
            live_room_id: liveRoom.id,
            user_id: userRes.id,
          });
        } else {
          // console.log(chalkWARN(`已存在id为：${user.id}的直播间！`));
        }
      };

      Object.keys(initUser).forEach((item) => {
        quequ.push(initOneUser(initUser[item]));
      });
      await Promise.all(quequ);
      await this.common.initUserWallet();
    },
    initUserWallet: async () => {
      const userListRes = await userModel.findAndCountAll();
      const handleWallet = async (item: IUser) => {
        const flag = await walletService.findByUserId(item.id!);
        if (!flag) {
          await walletService.create({ user_id: item.id, balance: 0 });
        } else {
          // console.log(chalkWARN(`id为${item.id!}的用户已存在钱包！`));
        }
      };
      const arr: any[] = [];
      userListRes.rows.forEach((item: IUser) => {
        arr.push(handleWallet(item));
      });
      await Promise.all(arr);
    },
    initDayData: async (total = 365 * 3) => {
      // const count = await mockDayDataModel.count();
      // if (count === 0) {
      await mockTimeBatchInsert({
        model: mockDayDataModel,
        unit: 'day',
        unitNum: 1,
        field: 'day',
        total,
        format: 'YYYY-MM-DD 00:00:00',
      });
      // } else {
      //   throw new CustomError(
      //     `已经初始化过${mockDayDataModel.tableName}表了，不能再初始化了！`,
      //     COMMON_HTTP_CODE.paramsError,
      //     COMMON_HTTP_CODE.paramsError
      //   );
      // }
    },
    initHourData: async (total = 365 * 3 * 24) => {
      await mockTimeBatchInsert({
        model: mockHourDataModel,
        unit: 'hour',
        unitNum: 1,
        field: 'hour',
        total,
        format: 'YYYY-MM-DD HH:00:00',
      });
    },
    initMinuteTenData: async (total = 365 * 3 * 24 * 6) => {
      await mockTimeBatchInsert({
        model: mockMinuteTenDataModel,
        unit: 'minute',
        unitNum: 10,
        field: 'minute',
        total,
        format: 'YYYY-MM-DD HH:mm:00',
      });
    },
    initMinuteThirtyData: async (total = 365 * 3 * 24 * 2) => {
      await mockTimeBatchInsert({
        model: mockMinuteThirtyDataModel,
        unit: 'minute',
        unitNum: 30,
        field: 'minute',
        total,
        format: 'YYYY-MM-DD HH:mm:00',
      });
    },
  };

  // 更新直播间url
  updateLiveRoomUrl = async (ctx: ParameterizedContext, next) => {
    const res1 = await liveRoomController.common.getPureList({
      exclude_key: false,
    });
    const queue: any[] = [];
    // @ts-ignore
    res1.rows.forEach((item: ILiveRoom) => {
      const srsPullRes = srsController.common.getPullUrl({
        liveRoomId: item.id!,
      });
      const srsPushRes = srsController.common.getPushUrl({
        liveRoomId: item.id!,
        type: item.type!,
        key: item.key!,
      });
      const cdnPullRes = tencentcloudUtils.getPullUrl({ liveRoomId: item.id! });
      const cdnPushRes = tencentcloudUtils.getPushUrl({
        liveRoomId: item.id!,
        type: item.type!,
        key: item.key!,
      });
      queue.push(
        liveRoomController.common.update({
          id: item.id,
          rtmp_url: srsPullRes.rtmp,
          flv_url: srsPullRes.flv,
          hls_url: srsPullRes.hls,
          webrtc_url: srsPullRes.webrtc,
          push_obs_server: srsPushRes.push_obs_server,
          push_obs_stream_key: srsPushRes.push_obs_stream_key,
          push_rtmp_url: srsPushRes.push_rtmp_url,
          push_srt_url: srsPushRes.push_srt_url,
          push_webrtc_url: srsPushRes.push_webrtc_url,
          cdn_flv_url: cdnPullRes.flv,
          cdn_hls_url: cdnPullRes.hls,
          cdn_push_rtmp_url: cdnPullRes.rtmp,
          cdn_webrtc_url: cdnPullRes.webrtc,
          cdn_push_obs_server: cdnPushRes.push_obs_server,
          cdn_push_obs_stream_key: cdnPushRes.push_obs_stream_key,
          cdn_push_srt_url: cdnPushRes.push_srt_url,
          cdn_push_webrtc_url: cdnPushRes.push_webrtc_url,
          cdn_rtmp_url: cdnPushRes.push_rtmp_url,
        })
      );
    });

    await Promise.all(queue);
    successHandler({ ctx, message: '更新直播间url成功！' });
    await next();
  };

  // 添加用户
  addUser = async (ctx: ParameterizedContext, next) => {
    await this.common.initRole();
    successHandler({ ctx, message: '初始化角色表成功！' });
    await next();
  };

  // 初始化角色
  initRole = async (ctx: ParameterizedContext, next) => {
    await this.common.initRole();
    successHandler({ ctx, message: '初始化角色表成功！' });
    await next();
  };

  // 初始化权限
  initAuth = async (ctx: ParameterizedContext, next) => {
    await this.common.initAuth();
    successHandler({ ctx, message: '初始化权限表成功！' });
    await next();
  };

  // 初始化商品
  initGoods = async (ctx: ParameterizedContext, next) => {
    await this.common.initGoods();
    successHandler({ ctx, message: '初始化商品成功！' });
    await next();
  };

  // 初始化设置
  initSettings = async (ctx: ParameterizedContext, next) => {
    await this.common.initSettings();
    successHandler({ ctx, message: '初始化设置表成功！' });
    await next();
  };

  // 初始化角色权限
  initRoleAuth = async (ctx: ParameterizedContext, next) => {
    await this.common.initRoleAuth();
    successHandler({ ctx, message: '初始化角色权限表成功！' });
    await next();
  };

  // 初始化角色、权限、角色权限
  rbacMode = async (ctx: ParameterizedContext, next) => {
    await Promise.all([
      roleModel.sync({ force: true }),
      authModel.sync({ force: true }),
      roleAuthModel.sync({ force: true }),
    ]);
    await this.common.initRole();
    await this.common.initAuth();
    await this.common.initRoleAuth();
    successHandler({ ctx, message: '初始化角色、权限、角色权限成功！' });
    await next();
  };

  // 初始化用户
  initUser = async (ctx: ParameterizedContext, next) => {
    await this.common.initUser();
    successHandler({ ctx, data: '初始化用户成功！' });
    await next();
  };

  // 初始化用户钱包
  initUserWallet = async (ctx: ParameterizedContext, next) => {
    await this.common.initUserWallet();
    successHandler({ ctx, data: '初始化用户钱包成功！' });
    await next();
  };

  // 初始化时间表
  initDayData = async (ctx: ParameterizedContext, next) => {
    await mockDayDataModel.sync({ alter: true });
    await this.common.initDayData(365 * 3);
    successHandler({
      ctx,
      data: `初始化${mockDayDataModel.tableName}表成功！`,
    });
    await next();
  };

  // 初始化时间表
  initHourData = async (ctx: ParameterizedContext, next) => {
    await mockHourDataModel.sync({ alter: true });
    await this.common.initHourData(365 * 3 * 24);
    successHandler({
      ctx,
      data: `初始化${mockHourDataModel.tableName}表成功！`,
    });
    await next();
  };

  // 初始化时间表
  initMinuteTenData = async (ctx: ParameterizedContext, next) => {
    await mockMinuteTenDataModel.sync({ alter: true });
    await this.common.initMinuteTenData(365 * 3 * 24 * 6);
    successHandler({
      ctx,
      data: `初始化${mockMinuteTenDataModel.tableName}表成功！`,
    });
    await next();
  };

  // 初始化时间表
  initMinuteThirtyData = async (ctx: ParameterizedContext, next) => {
    await mockMinuteThirtyDataModel.sync({ alter: true });
    await this.common.initMinuteThirtyData(365 * 3 * 24 * 2);
    successHandler({
      ctx,
      data: `初始化${mockMinuteThirtyDataModel.tableName}表成功！`,
    });
    await next();
  };

  // 重建表
  forceTable = async (ctx: ParameterizedContext, next) => {
    await Promise.all([
      logModel.sync({ force: true }),
      roleModel.sync({ force: true }),
      authModel.sync({ force: true }),
      roleAuthModel.sync({ force: true }),
      goodsModel.sync({ force: true }),
      userLiveRoomModel.sync({ force: true }),
      userRoleModel.sync({ force: true }),
      qqUserModel.sync({ force: true }),
      thirdUserModel.sync({ force: true }),
      liveModel.sync({ force: true }),
      liveRoomModel.sync({ force: true }),
      walletModel.sync({ force: true }),
      orderModel.sync({ force: true }),
    ]);

    successHandler({ ctx, data: '重建表成功！' });
    await next();
  };

  deleteUser = async (ctx: ParameterizedContext, next) => {
    const { userId } = ctx.request.body;
    const res1 = await thirdUserModel.findAndCountAll({
      where: { user_id: userId },
    });
    if (!res1.count) {
      throw new CustomError(
        // eslint-disable-next-line
        `不存在id为${userId}的用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const promise1: any[] = [];
    res1.rows.forEach((item) => {
      if (item.third_platform === THIRD_PLATFORM.qq) {
        promise1.push(
          qqUserModel.destroy({ where: { id: item.third_user_id } })
        );
      }
    });
    // 删除该用户的第三方用户信息（qq、github表）
    await Promise.all(promise1);
    // 删除该用户（user表）
    await userModel.destroy({ where: { id: userId } });
    // 删除该用户的第三方用户信息（third_user表）
    await thirdUserModel.destroy({ where: { user_id: userId } });

    // 删除该用户的所有角色（user_role表）
    await userRoleModel.destroy({ where: { user_id: userId } });

    // 删除该用户的钱包（wallet表）
    await walletModel.destroy({ where: { user_id: userId } });

    // 删除该用户的钱包记录（wallet_record表）
    await walletRecordModel.destroy({ where: { user_id: userId } });

    const res2 = await userLiveRoomModel.findAndCountAll({
      where: { user_id: userId },
    });
    const promise2: any[] = [];
    res2.rows.forEach((item) => {
      promise2.push(
        liveRoomModel.destroy({ where: { id: item.live_room_id } })
      );
      promise2.push(
        areaLiveRoomModel.destroy({
          where: { live_room_id: item.live_room_id },
        })
      );
    });

    // 删除该用户的所有直播间（live_room表）
    await Promise.all(promise2);

    // 删除该用户的所有直播间（user_live_room表）
    await userLiveRoomModel.destroy({ where: { user_id: userId } });

    // 删除该用户的直播（live_record表）
    await liveRecordModel.destroy({ where: { user_id: userId } });

    successHandler({ ctx, data: '删除用户成功！' });
    await next();
  };
}

export default new InitController();
