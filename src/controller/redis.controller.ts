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
    await redisClient.set(
      `${data.prefix}${data.key}`,
      JSON.stringify({
        value: data.value,
        created_at: data.created_at || +new Date(),
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
    await redisClient.setEx(
      `${data.prefix}${data.key}`,
      data.exp,
      JSON.stringify({
        value: data.value,
        created_at: data.created_at || +new Date(),
        expired_at: data.expired_at || +new Date() + data.exp * 1000,
        client_ip: data.client_ip || '',
      })
    );
  };

  setHashVal = async (data: {
    key: string;
    field: string;
    value: Record<string, any>;
  }) => {
    const res = await redisClient.hSetNX(
      data.key,
      data.field,
      JSON.stringify({
        value: data.value,
        created_at: +new Date(),
      })
    );
    return res;
  };

  delHashVal = async (data: { key: string; field: string }) => {
    const res = await redisClient.hDel(data.key, data.field);
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
    const res = await redisClient.sAdd(
      data.key,
      JSON.stringify({
        value: data.value,
        created_at: +new Date(),
      })
    );
    return res;
  };

  getSetVal = async (key: string) => {
    const res = await redisClient.sMembers(key);
    return res;
  };

  setListVal = async (data: { key: string; value: Record<string, any> }) => {
    const res = await redisClient.lPush(
      data.key,
      JSON.stringify({
        value: data.value,
        created_at: +new Date(),
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
