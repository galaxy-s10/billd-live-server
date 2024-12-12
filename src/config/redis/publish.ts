import { createClient } from 'redis';

import { REDIS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

export const pubClient = createClient({
  database: REDIS_CONFIG.database,
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
});

pubClient.on('error', (err) => {
  console.log(chalkERROR('pubClient 错误'));
  console.log(err);
  process.exit(1);
});

export const connectRedisPub = async () => {
  console.log(
    chalkINFO(
      `开始连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis Pub...`
    )
  );

  await pubClient.connect();

  await pubClient.configSet('notify-keyspace-events', 'Ex');
  // console.log(chalkINFO(`设置notify-keyspace-events: ${setRes}`));
  await pubClient.configGet('notify-keyspace-events');
  // console.log(
  //   chalkINFO(`获取notify-keyspace-events: ${getRes['notify-keyspace-events']}`)
  // );

  console.log(
    chalkSUCCESS(
      `连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis Pub 成功!`
    )
  );
};
