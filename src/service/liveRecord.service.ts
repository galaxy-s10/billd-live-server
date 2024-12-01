import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { literal, Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList, ILiveRecord } from '@/interface';
import areaModel from '@/model/area.model';
import liveRecordModel from '@/model/liveRecord.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveRecordService {
  /** 直播记录是否存在 */
  async isExist(ids: number[]) {
    const res = await liveRecordModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播记录列表 */
  async getList({
    id,
    platform,
    stream_name,
    stream_id,
    user_id,
    live_room_id,
    duration,
    danmu,
    view,
    start_time,
    end_time,
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
  }: IList<ILiveRecord>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      platform,
      stream_name,
      stream_id,
      user_id,
      live_room_id,
      duration,
      danmu,
      view,
      start_time,
      end_time,
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
    const childOrderRes: any[] = [];
    if (childOrderName && childOrderBy) {
      childOrderRes.push([liveRoomModel, childOrderName, childOrderBy]);
    }
    const result = await liveRecordModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
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
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      order: [...orderRes, ...childOrderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILiveRecord>(result, nowPage, pageSize);
  }

  async statistics1({ live_room_id, user_id, startTime, endTime }) {
    const result = await liveRecordModel.findAll({
      where: {
        ...deleteUseLessObjectKey({ live_room_id, user_id }),
        created_at: {
          [Op.between]: [new Date(startTime), new Date(endTime)],
        },
      },
    });
    return result;
  }

  /** 查找直播记录 */
  async find(id: number) {
    const result = await liveRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 修改直播记录 */
  async update(data: ILiveRecord) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveRecordModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 修改直播记录 */
  async updateDuration({ id, duration }: ILiveRecord) {
    const result = await liveRecordModel.update(
      // eslint-disable-next-line
      { duration: literal('`duration` +' + duration) },
      {
        where: { id },
        limit: 1,
      }
    );

    return result;
  }

  /** 创建直播记录 */
  async create(data: ILiveRecord) {
    const result = await liveRecordModel.create(data);
    return result;
  }

  /** 删除直播记录 */
  async delete(id: number) {
    const result = await liveRecordModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRecordService();
