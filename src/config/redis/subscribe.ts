import { createClient } from 'redis';

import { REDIS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

import { handleRedisSubscribe } from './handleRedisSubscribe';

export const subClient = createClient({
  database: REDIS_CONFIG.database,
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
});

subClient.on('error', (err) => {
  console.log(chalkERROR('subClient 错误'));
  console.log(err);
  process.exit(1);
});

export const connectRedisSub = async () => {
  console.log(
    chalkINFO(
      `开始连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis Sub...`
    )
  );

  await subClient.connect();
  console.log(
    chalkSUCCESS(
      `连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis Sub 成功!`
    )
  );
  handleRedisSubscribe();
};
