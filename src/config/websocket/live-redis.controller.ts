import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IUser } from '@/types/IUser';
import { filterObj } from '@/utils';

class WSController {
  /** 获取用户进入的房间 */
  getUserJoinedRoom = async (data: {
    socketId: string;
    joinRoomId: number;
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
      key: `${data.joinRoomId}___${data.socketId}`,
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
      key: `${data.joinRoomId}___${data.socketId}`,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
      exp: 30,
      created_at: data.created_at,
      expired_at: data.expired_at,
      client_ip: data.client_ip,
    });
    await redisController.setHashVal({
      key: `${REDIS_PREFIX.liveRoomOnlineUser}${data.joinRoomId}`,
      field: data.socketId,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
    });
    redisController.setExpire({
      key: `${REDIS_PREFIX.liveRoomOnlineUser}${data.joinRoomId}`,
      seconds: 30,
    });
    return res;
  };

  /** 删除用户进入的房间 */
  delUserJoinedRoom = async (data: {
    socketId: string;
    joinRoomId: number;
  }) => {
    await redisController.del({
      prefix: `${REDIS_PREFIX.joined}`,
      key: `${data.joinRoomId}___${data.socketId}`,
    });
    await redisController.delHashVal({
      key: `${REDIS_PREFIX.liveRoomOnlineUser}${data.joinRoomId}`,
      field: data.socketId,
    });
  };

  getSocketIdJoinLiveRoom = async () => {
    const res = await redisController.getAllHashVal(
      `${REDIS_PREFIX.socketIdJoinLiveRoom}`
    );
    return res;
  };

  /**
   * "created_at":1726139448310,
   * "format_created_at":"2024/9/12 19:10:48",
   * "value":{"socketId":"UmydF6sYvM4supgAAABj","joinRoomId":102}
   */
  getSocketIdJoinLiveRoomOne = async (data: { socketId: string }) => {
    try {
      const res1 = await redisController.getHashVal({
        key: `${REDIS_PREFIX.socketIdJoinLiveRoom}`,
        field: data.socketId,
      });
      if (res1) {
        const obj = JSON.parse(res1) as {
          created_at: number;
          format_created_at: string;
          value: {
            socketId: string;
            joinRoomId: number;
          };
        };
        return obj;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  setSocketIdJoinLiveRoom = async (data: {
    socketId: string;
    joinRoomId: number;
  }) => {
    await redisController.setHashVal({
      key: `${REDIS_PREFIX.socketIdJoinLiveRoom}`,
      field: data.socketId,
      value: data,
    });
  };

  delSocketIdJoinLiveRoom = async (data: { socketId: string }) => {
    await redisController.delHashVal({
      key: `${REDIS_PREFIX.socketIdJoinLiveRoom}`,
      field: data.socketId,
    });
  };

  updateSocketIdJoinLiveRoomExpire = async () => {
    await redisController.setExpire({
      key: `${REDIS_PREFIX.socketIdJoinLiveRoom}`,
      seconds: 30,
    });
  };

  /** 删除直播间直播 */
  delLiveRoomLiving = async (data: { liveRoomId: number }) => {
    const res = await redisController.del({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveRoomId}`,
    });
    return res;
  };

  /** 设置直播间正在直播 */
  setLiveRoomIsLiving = async (data: {
    liveRoomId: number;
    socketId: string;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const res = await redisController.setExVal({
      prefix: `${REDIS_PREFIX.roomIsLiveing}`,
      key: `${data.liveRoomId}`,
      value: filterObj(data, ['created_at', 'expired_at', 'client_ip']),
      exp: 30,
      created_at: data.created_at,
      expired_at: data.expired_at,
      client_ip: data.client_ip,
    });
    return res;
  };

  /** 获取直播间是否正在直播 */
  getLiveRoomIsLiving = async (data: {
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

  getLiveRoomOnlineUser = async (liveRoomId: number) => {
    const res = await redisController.getAllHashVal(
      `${REDIS_PREFIX.liveRoomOnlineUser}${liveRoomId}`
    );
    return res.map((v) => JSON.parse(v));
  };
}

export default new WSController();
