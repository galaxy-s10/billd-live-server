import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList, ILive } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

export async function handleDelRedisByDbLiveList() {
  // try {
  //   await redisController.delByPrefix({
  //     prefix: REDIS_PREFIX.dbLiveList,
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
}

class LiveService {
  /** 直播是否存在 */
  async isExist(ids: number[]) {
    const res = await liveModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播列表 */
  async getPureList({
    id,
    live_record_id,
    live_room_id,
    user_id,
    platform,
    stream_name,
    stream_id,
    remark,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['stream_name', 'stream_id', 'remark'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await liveModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILive>(result, nowPage, pageSize);
  }

  /** 获取直播列表 */
  async getList({
    id,
    live_record_id,
    live_room_id,
    user_id,
    platform,
    stream_name,
    stream_id,
    remark,
    childOrderName,
    childOrderBy,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive & ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['stream_name', 'stream_id', 'remark'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const childOrderRes = handleOrder(
      { orderName: childOrderName, orderBy: childOrderBy },
      liveRoomModel
    );
    const result = await liveModel.findAndCountAll({
      include: [
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
          // where: {
          //   ...subWhere,
          // },
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          // through: {
          //   attributes: [],
          // },
        },
      ],
      // 不能设置attributes: [],否则orderRes排序的时候，没有order字段就会报错
      // attributes: ['created_at'],
      // attributes: [],
      order: [...orderRes, ...childOrderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILive>(result, nowPage, pageSize);
  }

  /** 查找直播 */
  async find(id: number) {
    const result = await liveModel.findOne({ where: { id } });
    return result;
  }

  /** 获取直播列表 */
  async findAll({
    id,
    live_record_id,
    live_room_id,
    user_id,
    platform,
    stream_name,
    stream_id,
    remark,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive>) {
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['stream_name', 'stream_id', 'remark'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await liveModel.findAll({
      order: [...orderRes],
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILive>(result, nowPage, pageSize);
  }

  /** 查找直播（禁止对外。） */
  findByLiveRoomId = async (live_room_id: number) => {
    const res = await liveModel.findOne({
      include: [
        {
          model: liveRoomModel,
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      where: { live_room_id },
    });
    return res;
  };

  /** 查找直播 */
  findLiveRecordByLiveRoomId = async (live_room_id: number) => {
    const res = await liveModel.findOne({
      where: { live_room_id },
    });
    return res;
  };

  liveRoomisLive = async (live_room_id: number) => {
    const res = await liveModel.findOne({
      include: [
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      where: { live_room_id },
    });
    return res;
  };

  /** 修改直播 */
  async update(data: ILive) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveModel.update(data2, { where: { id }, limit: 1 });
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 创建直播 */
  async create(data: ILive) {
    const result = await liveModel.create(data);
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 删除直播 */
  async delete(id: number) {
    const result = await liveModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 删除直播 */
  deleteByLiveRoomId = async (liveRoomIds: number[]) => {
    const res = await liveModel.destroy({
      where: {
        live_room_id: liveRoomIds,
      },
    });
    handleDelRedisByDbLiveList();
    return res;
  };

  /** 删除直播 */
  deleteByUserId = async (user_id: number[]) => {
    const res = await liveModel.destroy({
      where: {
        user_id: {
          [Op.in]: user_id,
        },
      },
    });
    handleDelRedisByDbLiveList();
    return res;
  };
}

export default new LiveService();
