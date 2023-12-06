import { isPureNumber } from 'billd-utils';
import { Op, literal } from 'sequelize';

import { IList, ILiveRecord } from '@/interface';
import areaModel from '@/model/area.model';
import liveRecordModel from '@/model/liveRecord.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class LivePlayService {
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
    client_id,
    live_room_id,
    user_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRecord>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id !== undefined && isPureNumber(`${id}`)) {
      allWhere.id = id;
    }
    if (client_id !== undefined && isPureNumber(`${client_id}`)) {
      allWhere.client_id = client_id;
    }
    if (live_room_id !== undefined && isPureNumber(`${live_room_id}`)) {
      allWhere.live_room_id = live_room_id;
    }
    if (user_id !== undefined && isPureNumber(`${user_id}`)) {
      allWhere.user_id = user_id;
    }
    if (keyWord) {
      const keyWordWhere = [];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
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
            exclude: ['key'],
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
        exclude: ['key'],
        include: [
          [
            literal(
              `(select weight from ${liveRoomModel.tableName}
                where ${liveRoomModel.tableName}.id = ${liveRecordModel.tableName}.live_room_id)`
            ),
            'live_room_weight',
          ],
        ],
      },
      order: [
        [literal('live_room_weight'), 'desc'],
        [orderName, orderBy],
      ],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILiveRecord>(result, nowPage, pageSize);
  }

  /** 查找直播记录 */
  async find(id: number) {
    const result = await liveRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 修改直播记录 */
  async update({
    id,
    client_id,
    live_room_id,
    user_id,
    danmu,
    duration,
    view,
    end_time,
  }: ILiveRecord) {
    const result = await liveRecordModel.update(
      { client_id, live_room_id, user_id, danmu, duration, view, end_time },
      { where: { id } }
    );
    return result;
  }

  /** 修改直播记录 */
  async updateView({ live_room_id }: ILiveRecord) {
    const result = await liveRecordModel.update(
      { view: literal('`view` +1') },
      {
        where: { live_room_id, end_time: { [Op.not]: true } },
        silent: true, // silent如果为true，则不会更新updateAt时间戳。
      }
    );
    return result;
  }

  /** 修改直播记录 */
  async updateDanmu({ live_room_id }: ILiveRecord) {
    const result = await liveRecordModel.update(
      { danmu: literal('`danmu` +1') },
      {
        where: { live_room_id, end_time: { [Op.not]: true } },
        silent: true, // silent如果为true，则不会更新updateAt时间戳。
      }
    );
    return result;
  }

  /** 修改直播记录 */
  async updateByLiveRoomIdAndUserId({
    client_id,
    live_room_id,
    user_id,
    danmu,
    duration,
    view,
    end_time,
  }: ILiveRecord) {
    const result = await liveRecordModel.update(
      {
        danmu,
        duration,
        view,
        end_time,
      },
      { where: { client_id, live_room_id, user_id } }
    );
    return result;
  }

  /** 创建直播记录 */
  async create({
    client_id,
    live_room_id,
    user_id,
    danmu,
    duration,
    view,
    end_time,
  }: ILiveRecord) {
    const result = await liveRecordModel.create({
      client_id,
      live_room_id,
      user_id,
      danmu,
      duration,
      view,
      end_time,
    });
    return result;
  }

  /** 删除直播记录 */
  async delete(id: number) {
    const result = await liveRecordModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }

  /** 删除直播记录 */
  deleteByLiveRoomIdAndUserId = async (data: {
    client_id: number;
    live_room_id: number;
    user_id: number;
  }) => {
    const res = await liveRecordModel.destroy({
      where: {
        client_id: data.client_id,
        live_room_id: data.live_room_id,
        user_id: data.user_id,
      },
    });
    return res;
  };
}

export default new LivePlayService();
