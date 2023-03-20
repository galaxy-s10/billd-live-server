import { IData, liveExp } from './constant';

import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';

const chooseSongListKey = '-';
const setHistoryHightOnlineNum = '-';
const currDayHightOnlineNum = '-';

class WSController {
  live(id: string, data: IData) {
    redisController.setExVal({
      prefix: REDIS_PREFIX.live,
      key: id,
      exp: liveExp,
      value: JSON.stringify(data),
    });
  }

  die(id: string) {
    redisController.setExVal({
      prefix: REDIS_PREFIX.live,
      key: id,
      exp: 1,
      value: JSON.stringify({}),
    });
  }

  /** 新增一个在线用户 */
  addOnlineUser = async (id: string, data: IData) => {
    const res = await redisController.setHashVal(
      REDIS_PREFIX.onlineUser,
      id,
      data
    );
    return res;
  };

  /** 删除一个在线用户 */
  deleteOnlineUser = async (id: string) => {
    const res = await redisController.delHashVal(REDIS_PREFIX.onlineUser, id);
    return res;
  };

  /** 获取一个在线用户 */
  getOnlineUser = async (id: string) => {
    const res = await redisController.getHashVal(REDIS_PREFIX.onlineUser, id);
    return res;
  };

  /** 获取所有在线用户 */
  getAllOnlineUser = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineUser);
    return res;
  };

  /** 获取在线用户数量 */
  getAllOnlineUserNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineUser);
    return res;
  };

  /** 新增一个在线游客 */
  addOnlineVisitor = async (id: string, data: IData) => {
    const res = await redisController.setHashVal(
      REDIS_PREFIX.onlineVisitor,
      id,
      data
    );
    return res;
  };

  /** 删除一个在线游客 */
  deleteOnlineVisitor = async (id) => {
    const res = await redisController.delHashVal(
      REDIS_PREFIX.onlineVisitor,
      id
    );
    return res;
  };

  /** 获取一个在线游客 */
  getOnlineVisitor = async (id) => {
    const res = await redisController.getHashVal(
      REDIS_PREFIX.onlineVisitor,
      id
    );
    return res;
  };

  /** 获取所有在线游客 */
  getAllOnlineVisitor = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineVisitor);
    return res;
  };

  /** 获取在线游客数量 */
  getAllOnlineVisitorNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineVisitor);
    return res;
  };

  /** 新增一个在线人 */
  addOnlineList = async (id: string, data: IData) => {
    const res = await redisController.setHashVal(
      REDIS_PREFIX.onlineList,
      id,
      data
    );
    return res;
  };

  /** 删除一个在线人 */
  deleteOnlineList = async (id) => {
    const res = await redisController.delHashVal(REDIS_PREFIX.onlineList, id);
    return res;
  };

  /** 获取一个在线人 */
  getOnlineList = async (id) => {
    const res = await redisController.getHashVal(REDIS_PREFIX.onlineList, id);
    return res;
  };

  /** 获取所有在线人 */
  getAllOnlineList = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineList);
    return res;
  };

  /** 获取在线人数量 */
  getAllOnlineListNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineList);
    return res;
  };

  /** 历史最高同时在线数 */
  setHistoryHightOnlineNum = async (value: {
    nickname: string;
    song: { id: number; name: string };
    created_at: string;
  }) => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.historyHightOnlineNum,
      key: setHistoryHightOnlineNum,
    });
    let res: any[] = [];
    if (!oldData) {
      res = [value];
    } else {
      res.push(...JSON.parse(oldData), value);
    }
    await redisController.setVal({
      prefix: REDIS_PREFIX.historyHightOnlineNum,
      key: setHistoryHightOnlineNum,
      value: JSON.stringify(res),
    });
  };

  /** 获取当天最高同时在线数 */
  getCurrDayHightOnlineNum = async () => {
    const res = await redisController.getVal({
      prefix: REDIS_PREFIX.currDayHightOnlineNum,
      key: currDayHightOnlineNum,
    });
    return res;
  };

  /** 设置当天最高同时在线数 */
  setCurrDayHightOnlineNum = async (data: IData) => {
    const res = await redisController.setVal({
      prefix: REDIS_PREFIX.currDayHightOnlineNum,
      key: currDayHightOnlineNum,
      value: JSON.stringify(data),
    });
    return res;
  };

  /** 设置点歌列表 */
  setChooseSongList = async (value: {
    nickname: string;
    song: { id: number; name: string };
    created_at: string;
  }) => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
    });
    let res: any[] = [];
    if (!oldData) {
      res = [value];
    } else {
      res.push(...JSON.parse(oldData), value);
    }
    await redisController.setVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
      value: JSON.stringify(res),
    });
  };

  /** 获取点歌 */
  getChooseSongList = async () => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
    });
    return JSON.parse(oldData || '[]');
  };
}

export default new WSController();
