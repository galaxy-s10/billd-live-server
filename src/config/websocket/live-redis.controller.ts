import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IUser } from '@/types/IUser';

class WSController {
  joined = async (data: {
    roomId: number;
    userInfo: IUser;
    /** 有效期，单位：秒 */
    exp: number;
    client_ip?: string;
  }) => {
    const userId = data.userInfo?.id || -1;
    await redisController.setExVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: `${userId}___${data.roomId}`,
      value: {},
      exp: data.exp,
      client_ip: data.client_ip,
    });
  };

  /** 增加房间里的在线用户 */
  addLiveRoomOnlineUser = async (data: {
    liveRoomId: number;
    liveRoomName: string;
    userInfo: IUser;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const userId = data.userInfo?.id || -1;
    await redisController.setHashVal({
      key: `${REDIS_PREFIX.liveRoomOnlineUser}${data.liveRoomId}`,
      field: `${userId}`,
      value: {
        live_room_id: data.liveRoomId,
        live_room_name: data.liveRoomName,
        user_id: data.userInfo?.id,
        user_username: data.userInfo?.username,
        user_avatar: data.userInfo?.avatar,
      },
      client_ip: data.client_ip || '',
    });
  };

  /** 删除房间里的在线用户 */
  delLiveRoomOnlineUser = async (data: { roomId: number; userId: string }) => {
    await redisController.delHashVal({
      key: `${REDIS_PREFIX.liveRoomOnlineUser}${data.roomId}`,
      field: `${data.userId}`,
    });
  };

  setTencentcloudCssPublishing = async (data: {
    data: {
      live_room_id: number;
      live_record_id: number;
      live_id: number;
    };
    /** 有效期，单位：秒 */
    exp: number;
    client_ip?: string;
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_PREFIX.tencentcloudCssPublishing}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
      client_ip: data.client_ip,
    });
  };

  setSrsPublishing = async (data: {
    data: {
      live_room_id: number;
      live_record_id: number;
      live_id: number;
    };
    /** 有效期，单位：秒 */
    exp: number;
    client_ip?: string;
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_PREFIX.srsPublishing}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
      client_ip: data.client_ip,
    });
  };

  setRtcLiving = async (data: {
    data: {
      live_room_id: number;
      live_record_id: number;
      live_id: number;
    };
    /** 有效期，单位：秒 */
    exp: number;
    client_ip?: string;
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_PREFIX.rtcLiving}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
      client_ip: data.client_ip,
    });
  };

  /** 获取房间里的在线用户 */
  getLiveRoomOnlineUser = async (liveRoomId: number) => {
    const res = await redisController.getAllHashVal(
      `${REDIS_PREFIX.liveRoomOnlineUser}${liveRoomId}`
    );
    return res.map((v) => JSON.parse(v));
  };
}

export default new WSController();
