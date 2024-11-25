import { pubClient } from '@/config/redis/pub';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { REDIS_PREFIX } from '@/constant';
import liveRecordController from '@/controller/liveRecord.controller';
import orderController from '@/controller/order.controller';
import srsController from '@/controller/srs.controller';
import tencentcloudCssController from '@/controller/tencentcloudCss.controller';
import { REDIS_CONFIG } from '@/secret/secret';

export const handleRedisKeyExpired = () => {
  pubClient.subscribe(
    `__keyevent@${REDIS_CONFIG.database}__:expired`,
    async (redisKey, subscribeName) => {
      console.log('过期key监听', redisKey, subscribeName);
      try {
        // tencentcloudCssPublishing过期
        if (redisKey.indexOf(REDIS_PREFIX.tencentcloudCssPublishing) === 0) {
          const key = redisKey.replace(
            `${REDIS_PREFIX.tencentcloudCssPublishing}`,
            ''
          );
          console.log('tencentcloudCssPublishing过期', key);
          // key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
          const keyArr = key.split('___');
          const live_room_id = Number(keyArr[0]);
          const live_record_id = Number(keyArr[1]);
          const live_id = Number(keyArr[2]);
          if (!live_room_id || !live_record_id || !live_id) {
            return;
          }
          const islive = await tencentcloudCssController.common.isLive(
            live_room_id
          );
          if (islive) {
            await liveRedisController.setTencentcloudCssPublishing({
              data: {
                live_id,
                live_record_id,
                live_room_id,
              },
              exp: 5,
            });
            await liveRecordController.common.updateDuration({
              id: live_record_id,
              duration: 5,
            });
          } else {
            await tencentcloudCssController.common.closeLive({
              live_room_id,
            });
          }
        }

        // srsPublishing过期
        if (redisKey.indexOf(REDIS_PREFIX.srsPublishing) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.srsPublishing}`, '');
          console.log('srsPublishing过期', key);
          // key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
          const keyArr = key.split('___');
          const live_room_id = Number(keyArr[0]);
          const live_record_id = Number(keyArr[1]);
          const live_id = Number(keyArr[2]);
          if (!live_room_id || !live_record_id || !live_id) {
            return;
          }
          const islive = await srsController.common.isLive(live_room_id);
          if (islive) {
            await liveRedisController.setSrsPublishing({
              data: {
                live_id,
                live_record_id,
                live_room_id,
              },
              exp: 5,
            });
            await liveRecordController.common.updateDuration({
              id: live_record_id,
              duration: 5,
            });
          } else {
            await tencentcloudCssController.common.closeLive({
              live_room_id,
            });
          }
        }

        // joined过期
        if (redisKey.indexOf(REDIS_PREFIX.joined) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.joined}`, '');
          console.log('joined过期', key);
          const keyArr = key.split('___');
          const userId = keyArr[0];
          const roomId = keyArr[1];
          await liveRedisController.delLiveRoomOnlineUser({
            roomId: Number(roomId),
            userId: Number(userId),
          });
        }

        // 订单过期
        if (redisKey.indexOf(REDIS_PREFIX.order) === 0) {
          const out_trade_no = redisKey.replace(`${REDIS_PREFIX.order}`, '');
          console.log('订单过期', out_trade_no);
          await orderController.common.getPayStatus(out_trade_no, true);
        }

        // 房间不直播了
        if (redisKey.indexOf(REDIS_PREFIX.roomIsLiveing) === 0) {
          const liveRoomId = redisKey.replace(
            `${REDIS_PREFIX.roomIsLiveing}`,
            ''
          );
          console.log('房间不直播了', liveRoomId);
        }
      } catch (error) {
        console.log(error);
      }
    }
  );
};
