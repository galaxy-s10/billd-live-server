import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';

class WSController {
  /** 新增一个在线用户 */
  addOnlineList = async (data: {
    roomId: string;
    socketId: string;
    data: string;
  }) => {
    const res = await redisController.setHashVal(
      `${REDIS_PREFIX.roomId}-${data.roomId}`,
      data.socketId,
      data.data
    );
    return res;
  };

  /** 删除一个在线用户 */
  deleteOnlineList = async (data: { roomId: string; socketId: string }) => {
    const res = await redisController.delHashVal(
      `${REDIS_PREFIX.roomId}-${data.roomId}`,
      data.socketId
    );
    return res;
  };

  /** 获取所有在线用户 */
  getOnlineList = async (data: { roomId: string }) => {
    const res = await redisController.getAllHashVal(
      `${REDIS_PREFIX.roomId}-${data.roomId}`
    );
    return res;
  };

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
