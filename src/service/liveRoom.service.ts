import { deleteUseLessObjectKey, filterObj, isPureNumber } from 'billd-utils';
import { Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveRoomService {
  /** 直播间是否存在 */
  async isExist(ids: number[]) {
    const res = await liveRoomModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播间列表 */
  async getList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
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
    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: { attributes: [] },
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取直播间列表 */
  async getPureList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
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
    const result = await liveRoomModel.findAndCountAll({
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找直播间 */
  async find(id: number) {
    const result = await liveRoomModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findPure(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findByName(name: string) {
    const result = await liveRoomModel.findOne({
      include: [
        {
          model: userLiveRoomModel,
          include: [
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
            },
          ],
          required: true,
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { name },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: ['key'],
      where: { id },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey2(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: LIVE_ROOM_MODEL_EXCLUDE,
      where: { id },
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
    });
    return result;
  }

  /** 修改直播间 */
  async update(data: ILiveRoom) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveRoomModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建直播间 */
  async create(data: ILiveRoom) {
    const result = await liveRoomModel.create(data);
    return result;
  }

  /** 删除直播间 */
  async delete(id: number) {
    const result = await liveRoomModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomService();
