import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IArea, IList } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
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

class AreaService {
  /** 分区是否存在 */
  async isExist(ids: number[]) {
    const res = await areaModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取分区列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({ keyWord, arr: ['name', 'remark'] });
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
    const result = await areaModel.findAndCountAll({
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

  /** 获取分区直播间列表 */
  async getLiveRoomList({ area_id, is_show, status, nowPage, pageSize }) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const childWhere = deleteUseLessObjectKey({
      is_show,
      status,
    });
    const result = await liveRoomModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: areaModel,
          through: {
            attributes: [],
          },
          where: { id: area_id },
        },
        {
          model: liveModel,
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { ...childWhere },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取分区列表 */
  async getAreaLiveRoomList({
    id,
    cdn,
    is_fake,
    is_show,
    status,
    childNowPage,
    childPageSize,
    childOrderName,
    childOrderBy,
    childKeyWord,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea & ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    let childOffset;
    let childLimit;
    if (childNowPage && childPageSize) {
      childOffset = (+childNowPage - 1) * +childPageSize;
      childLimit = +childPageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({ keyWord, arr: ['name', 'remark'] });
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
    const childWhere = deleteUseLessObjectKey({
      cdn,
      is_fake,
      is_show,
      status,
    });
    if (childKeyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
        {
          remark: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
      ];
      childWhere[Op.or] = keyWordWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const childOrderRes: any[] = [];
    if (childOrderName && childOrderBy) {
      childOrderRes.push([liveRoomModel, childOrderName, childOrderBy]);
      // childOrderRes.push([
      //   literal(`${liveRoomModel.tableName}.${childOrderName}`),
      //   childOrderBy,
      // ]);
    }
    const result = await areaModel.findAndCountAll({
      limit,
      offset,
      order: [...orderRes],
      where: { ...allWhere },
    });
    const queue: any[] = [];
    result.rows.forEach((item) => {
      queue.push(
        areaLiveRoomModel.findAll({
          limit: childLimit,
          offset: childOffset,
          include: [
            {
              model: liveRoomModel,
              attributes: {
                exclude: LIVE_ROOM_MODEL_EXCLUDE,
              },
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
                  attributes: ['id'],
                },
                {
                  model: liveModel,
                  attributes: ['id'],
                },
              ],
              where: { ...childWhere },
            },
          ],
          attributes: [],
          order: [...childOrderRes],
          where: {
            area_id: item.id,
          },
        })
      );
    });
    const result2 = await Promise.all(queue);
    const result3 = result.rows.map((item, index) => {
      return {
        ...item.get(),
        live_rooms: result2[index].map((vv) => {
          const res = {
            ...vv.live_room.get(),
            user: vv.live_room.user_live_room.user,
          };
          delete res.user_live_room;
          return res;
        }),
      };
    });
    return handlePaging(
      { count: result.count, rows: result3 },
      nowPage,
      pageSize
    );
  }

  /** 查找分区 */
  async find(id: number) {
    const result = await areaModel.findOne({
      include: [
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
        },
      ],
      where: { id },
    });
    return result;
  }

  /** 创建分区 */
  async create(data: IArea) {
    const result = await areaModel.create(data);
    return result;
  }

  /** 修改分区 */
  async update(data: IArea) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await areaModel.update(data2, { where: { id }, limit: 1 });
    return result;
  }

  /** 删除分区 */
  async delete(id: number) {
    const result = await areaModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new AreaService();
