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
      joinRoomId: number;
      socketId: string;
      userInfo?: IUser;
    };
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
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
    joinRoomId: number;
    userInfo?: IUser;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
      exp: 60 * 1,
      created_at: data.created_at,
      expired_at: data.expired_at,
      client_ip: data.client_ip,
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

  /** 删除主播正在直播 */
  delAnchorLiving = async (data: { liveRoomId: number }) => {
    const res = await redisController.del({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveRoomId}`,
    });
    return res;
  };

  /** 设置主播正在直播 */
  setAnchorLiving = async (data: {
    socketId: string;
    liveRoomId: number;
    userInfo?: IUser;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveRoomId}`,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
      exp: 60 * 1,
      created_at: data.created_at,
      expired_at: data.expired_at,
      client_ip: data.client_ip,
    });
    return res;
  };

  /** 获取主播是否正在直播 */
  getAnchorLiving = async (data: {
    liveRoomId: number;
  }): Promise<{
    value: {
      liveRoomId: number;
      socketId: string;
      userInfo?: IUser;
    };
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  } | null> => {
    const res = await redisController.getVal({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveRoomId}`,
    });
    return res ? JSON.parse(res) : null;
  };

  /** 设置主播禁言用户*/
  setDisableSpeaking = async (data: {
    liveRoomId: number;
    userId: number;
    exp: number;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.disableSpeaking}`,
      key: `${data.liveRoomId}-${data.userId}`,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
      exp: data.exp,
      created_at: data.created_at,
      expired_at: data.expired_at,
      client_ip: data.client_ip,
    });
    return res;
  };

  /** 获取主播禁言用户*/
  getDisableSpeaking = async (data: {
    liveRoomId: number;
    userId: number;
  }): Promise<{
    value: {
      userId: number;
      liveRoomId: number;
      exp: number;
    };
    created_at: number;
    expired_at: number;
    client_ip: string;
  }> => {
    const res = await redisController.getVal({
      prefix: `${REDIS_PREFIX.disableSpeaking}`,
      key: `${data.liveRoomId}-${data.userId}`,
    });
    return res ? JSON.parse(res) : null;
  };

  clearDisableSpeaking = async (data: {
    liveRoomId: number;
    userId: number;
  }) => {
    const res = await redisController.del({
      prefix: `${REDIS_PREFIX.disableSpeaking}`,
      key: `${data.liveRoomId}-${data.userId}`,
    });
    return res;
  };
}

export default new WSController();
