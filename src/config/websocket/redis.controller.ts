import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';

class WSController {
  /** 获取用户进入的房间 */
  getUserJoinedRoom = async (data: { socketId: string }) => {
    const res = await redisController.getVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
    });
    return res;
  };

  /** 设置用户进入的房间 */
  setUserJoinedRoom = async (data: { socketId: string; roomId: string }) => {
    const res = await redisController.setVal({
      prefix: `${REDIS_PREFIX.joined}`,
      key: data.socketId,
      value: JSON.stringify({ roomId: data.roomId }),
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
}

export default new WSController();
