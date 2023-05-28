import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IUser } from '@/interface';
import { filterObj } from '@/utils';

class WSController {
  /** 获取用户进入的房间 */
  getUserJoinedRoom = async (data: {
    socketId: string;
  }): Promise<{
    value: {
      roomId: string;
      socketId: string;
      userInfo: IUser;
    };
    created_at?: number;
    expired_at?: number;
  } | null> => {
    const res = await redisController.getVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
    });
    return res ? JSON.parse(res) : null;
  };

  /** 设置用户进入的房间 */
  setUserJoinedRoom = async (data: {
    socketId: string;
    roomId: string;
    userInfo?: IUser;
    created_at?: number;
    expired_at?: number;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
      value: filterObj(data, ['created_at', 'expired_at']),
      created_at: data.created_at,
      expired_at: data.expired_at,
      exp: 60 * 2,
    });
    return res;
  };

  /** 删除用户进入的房间 */
  delUserJoinedRoom = async (data: { socketId: string }) => {
    const res = await redisController.del({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
    });
    return res;
  };

  /** 设置用户正在直播 */
  setUserLiveing = async (data: {
    liveId: number;
    socketId: string;
    roomId: string;
    userInfo?: IUser;
    created_at?: number;
    expired_at?: number;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveId}`,
      value: filterObj(data, ['created_at', 'expired_at']),
      created_at: data.created_at,
      expired_at: data.expired_at,
      exp: 60 * 2,
    });
    return res;
  };

  /** 获取用户正在直播 */
  getUserLiveing = async (data: { liveId: number }) => {
    const res = await redisController.getVal({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveId}`,
    });
    return res;
  };
}

export default new WSController();
