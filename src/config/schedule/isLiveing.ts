import LiveRedisController from '@/config/websocket/live-redis.controller';
import liveController from '@/controller/live.controller';

export const handleRoomIsLiving = async () => {
  async function handleExpired(liveId) {
    const flag = await LiveRedisController.getUserLiveing({ liveId });
    if (!flag) {
      liveController.common.delete(liveId);
    }
  }
  try {
    const res = await liveController.common.getList({});
    res.rows.forEach((item) => {
      // 不对系统直播做处理
      if (item.system !== 1) {
        handleExpired(item.id);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
