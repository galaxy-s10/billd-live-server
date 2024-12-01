import { pubClient } from '@/config/redis/pub';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { REDIS_PREFIX } from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import orderController from '@/controller/order.controller';
import srsController from '@/controller/srs.controller';
import tencentcloudCssController from '@/controller/tencentcloudCss.controller';
import { REDIS_CONFIG } from '@/secret/secret';
import { chalkINFO, chalkWARN } from '@/utils/chalkTip';

export const handleRedisKeyExpired = () => {
  pubClient.subscribe(
    `__keyevent@${REDIS_CONFIG.database}__:expired`,
    async (redisKey, subscribeName) => {
      console.log(chalkWARN('过期key监听'), redisKey, subscribeName);
      try {
        // tencentcloudCssPublishing过期
        if (redisKey.indexOf(REDIS_PREFIX.tencentcloudCssPublishing) === 0) {
          const key = redisKey.replace(
            `${REDIS_PREFIX.tencentcloudCssPublishing}`,
            ''
          );
          console.log(chalkINFO('tencentcloudCssPublishing过期'), key);
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
              exp: 10,
            });
            await liveRecordController.common.updateDuration({
              id: live_record_id,
              duration: 10,
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
          console.log(chalkINFO('srsPublishing过期'), key);
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

        // rtcLiving过期
        if (redisKey.indexOf(REDIS_PREFIX.rtcLiving) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.rtcLiving}`, '');
          console.log(chalkINFO('rtcLiving过期'), key);
          // key: `${data.data.live_room_id}___${data.data.live_record_id}___${data.data.live_id}`,
          const keyArr = key.split('___');
          const live_room_id = Number(keyArr[0]);
          const live_record_id = Number(keyArr[1]);
          const live_id = Number(keyArr[2]);
          if (!live_room_id || !live_record_id || !live_id) {
            return;
          }
          await liveController.common.delete(live_id);
          await liveRecordController.common.update({
            id: live_record_id,
            // @ts-ignore
            end_time: +new Date(),
          });
        }

        // joined过期
        if (redisKey.indexOf(REDIS_PREFIX.joined) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.joined}`, '');
          console.log(chalkINFO('joined过期'), key);
          const keyArr = key.split('___');
          const userId = keyArr[0];
          const roomId = keyArr[1];
          await liveRedisController.delLiveRoomOnlineUser({
            roomId: Number(roomId),
            userId,
          });
        }

        // 订单过期
        if (redisKey.indexOf(REDIS_PREFIX.order) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.order}`, '');
          console.log(chalkINFO('订单过期'), key);
          await orderController.common.getPayStatus(key, true);
        }

        // 房间不直播了
        if (redisKey.indexOf(REDIS_PREFIX.roomIsLiveing) === 0) {
          const key = redisKey.replace(`${REDIS_PREFIX.roomIsLiveing}`, '');
          console.log(chalkINFO('房间不直播了'), key);
        }
      } catch (error) {
        console.log(error);
      }
    }
  );
};
