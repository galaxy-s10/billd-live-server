import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IArea, IList } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op, col, literal } = Sequelize;

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
    name,
    remark,
    weight,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      remark,
      weight,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
          remark: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await areaModel.findAndCountAll({
      distinct: true,
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取分区直播间列表 */
  async getLiveRoomList({ area_id, nowPage, pageSize }) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const inst = await areaModel.findOne({ where: { id: area_id } });
    // @ts-ignore
    const count = (await inst?.countLive_rooms()) || 0;
    // @ts-ignore
    const result = await inst.getLive_rooms({
      limit,
      offset,
      include: [
        {
          model: areaModel,
          through: {
            attributes: [],
          },
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
    });
    return handlePaging({ rows: result, count }, nowPage, pageSize);
  }

  /** 获取分区列表 */
  async getAreaLiveRoomList({
    id,
    name,
    remark,
    weight,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      remark,
      weight,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
          remark: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await areaModel.findAndCountAll({
      include: [
        {
          model: areaLiveRoomModel,
          limit: 4,
          include: [
            {
              model: liveRoomModel,
              attributes: {
                exclude: ['key'],
              },
              include: [
                {
                  model: liveModel,
                },
              ],
            },
          ],
          // https://www.sequelize.cn/other-topics/sub-queries#%E4%BD%BF%E7%94%A8%E5%AD%90%E6%9F%A5%E8%AF%A2%E8%BF%9B%E8%A1%8C%E5%A4%8D%E6%9D%82%E6%8E%92%E5%BA%8F

          attributes: {
            include: [
              [
                literal(
                  `(select weight from ${liveRoomModel.tableName}
                    where ${liveRoomModel.tableName}.id = ${areaLiveRoomModel.tableName}.live_room_id)`
                ),
                'live_room_weight',
              ],
            ],
          },
          order: [['live_room_weight', 'desc']],
        },
      ],
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找分区 */
  async find(id: number) {
    const result = await areaModel.findOne({
      include: [
        {
          model: liveRoomModel,
        },
      ],
      where: { id },
    });
    return result;
  }

  /** 修改分区 */
  async update({ id, name, remark, weight }: IArea) {
    const result = await areaModel.update(
      {
        name,
        remark,
        weight,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建分区 */
  async create({ name, remark, weight }: IArea) {
    const result = await areaModel.create({
      name,
      remark,
      weight,
    });
    return result;
  }

  /** 删除分区 */
  async delete(id: number) {
    const result = await areaModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new AreaService();
