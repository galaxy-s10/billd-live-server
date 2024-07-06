import { redisClient } from '@/config/redis';

class RedisController {
  /**
   * @description: 从 Redis 2.8 开始，-1代表key 存在，但没有设置剩余生存时间；-2代表key不存在
   * @param {*} param1
   * @return {*}
   */
  getTTL = async (data: { prefix: string; key: string }) => {
    const res = await redisClient.ttl(`${data.prefix}${data.key}`);
    return res;
  };

  del = async (data: { prefix: string; key: string }) => {
    const res = await redisClient.del(`${data.prefix}${data.key}`);
    return res;
  };

  findByPrefix = async (data: { prefix: string }) => {
    const res = await redisClient.keys(`${data.prefix}*`);
    return res;
  };

  delByPrefix = async (data: { prefix: string }) => {
    const res = await redisClient.keys(`${data.prefix}*`);
    const queue: Promise<any>[] = [];
    res.forEach((key) => {
      queue.push(redisClient.del(key));
    });
    await Promise.all(queue);
    return res;
  };

  getVal = async (data: { prefix: string; key: string }) => {
    const res = await redisClient.get(`${data.prefix}${data.key}`);
    return res;
  };

  setVal = async (data: {
    prefix: string;
    key: string;
    value: Record<string, any>;
    created_at?: number;
  }) => {
    const nowTime = +new Date();
    const createdAt = data.created_at || nowTime;
    await redisClient.set(
      `${data.prefix}${data.key}`,
      JSON.stringify({
        created_at: createdAt,
        format_created_at: new Date(createdAt).toLocaleString(),
        value: data.value,
      })
    );
  };

  setExVal = async (data: {
    prefix: string;
    key: string;
    value: Record<string, any>;
    /** 有效期，单位：秒 */
    exp: number;
    created_at?: number;
    expired_at?: number;
    client_ip?: string;
  }) => {
    const nowTime = +new Date();
    const createdAt = data.created_at || nowTime;
    const expiredAt = data.expired_at || nowTime + data.exp * 1000;
    await redisClient.setEx(
      `${data.prefix}${data.key}`,
      data.exp,
      JSON.stringify({
        created_at: createdAt,
        expired_at: expiredAt,
        format_created_at: new Date(createdAt).toLocaleString(),
        format_expired_at: new Date(expiredAt).toLocaleString(),
        client_ip: data.client_ip || '',
        value: data.value,
      })
    );
  };

  setHashVal = async (data: {
    key: string;
    field: string;
    value: Record<string, any>;
  }) => {
    const createdAt = +new Date();
    // 执行HSET命令并指定已存在的字段，那么这个字段的值会被新值覆盖。
    // 你不希望覆盖已存在的字段的值，你可以使用hSetNX命令，这个命令只有在指定的字段不存在时，才会设置值。
    const res = await redisClient.hSet(
      data.key,
      data.field,
      JSON.stringify({
        created_at: createdAt,
        format_created_at: new Date(createdAt).toLocaleString(),
        value: data.value,
      })
    );
    return res;
  };

  delHashVal = async (data: { key: string; field: string }) => {
    const res = await redisClient.hDel(data.key, data.field);
    return res;
  };

  setExpire = async (data: { key: string; seconds: number }) => {
    const res = await redisClient.expire(data.key, data.seconds);
    return res;
  };

  getHashVal = async (data: { key: string; field: string }) => {
    const res = await redisClient.hGet(data.key, data.field);
    return res;
  };

  getAllHashVal = async (key: string) => {
    const res = await redisClient.hVals(key);
    return res;
  };

  getHashLenVal = async (key: string) => {
    const res = await redisClient.hLen(key);
    return res;
  };

  setSetVal = async (data: { key: string; value: Record<string, any> }) => {
    const createdAt = +new Date();
    const res = await redisClient.sAdd(
      data.key,
      JSON.stringify({
        created_at: createdAt,
        format_created_at: new Date(createdAt).toLocaleString(),
        value: data.value,
      })
    );
    return res;
  };

  getSetVal = async (key: string) => {
    const res = await redisClient.sMembers(key);
    return res;
  };

  setListVal = async (data: { key: string; value: Record<string, any> }) => {
    const createdAt = +new Date();
    const res = await redisClient.lPush(
      data.key,
      JSON.stringify({
        created_at: createdAt,
        format_created_at: new Date(createdAt).toLocaleString(),
        value: data.value,
      })
    );
    return res;
  };

  getListVal = async (key: string) => {
    const res = await redisClient.lRange(key, 0, -1);
    return res;
  };
}

export default new RedisController();
