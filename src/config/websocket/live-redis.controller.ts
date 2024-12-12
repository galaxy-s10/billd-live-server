import { REDIS_KEY } from '@/constant';
import redisController from '@/controller/redis.controller';

class WSController {
  joined = async (data: {
    roomId: number;
    userId: number | string;
    /** 有效期，单位：秒 */
    exp: number;
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_KEY.joined}`,
      key: `${data.roomId}___${data.userId}`,
      value: {},
      exp: data.exp,
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
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_KEY.tencentcloudCssPublishing}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
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
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_KEY.srsPublishing}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
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
  }) => {
    await redisController.setExVal({
      prefix: `${REDIS_KEY.rtcLiving}`,
      key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
      value: {},
      exp: data.exp,
    });
  };
}

export default new WSController();
