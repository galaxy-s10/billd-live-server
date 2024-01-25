import { pubClient } from '@/config/redis/pub';
import { REDIS_PREFIX } from '@/constant';
import liveController from '@/controller/live.controller';
import orderController from '@/controller/order.controller';
import { REDIS_CONFIG } from '@/secret/secret';

export const handleRedisKeyExpired = () => {
  pubClient.subscribe(
    `__keyevent@${REDIS_CONFIG.database}__:expired`,
    (redisKey, subscribeName) => {
      console.log('过期key监听', redisKey, subscribeName);

      // 订单过期
      if (redisKey.indexOf(REDIS_PREFIX.order) === 0) {
        const out_trade_no = redisKey.replace(`${REDIS_PREFIX.order}`, '');
        console.log('订单过期', out_trade_no);
        orderController.common.getPayStatus(out_trade_no, true);
      }

      // 房间不直播了
      if (redisKey.indexOf(REDIS_PREFIX.roomIsLiveing) === 0) {
        const liveId = redisKey.replace(`${REDIS_PREFIX.roomIsLiveing}`, '');
        console.log('房间不直播了', liveId);
        liveController.common.delete(+liveId);
      }
    }
  );
};
