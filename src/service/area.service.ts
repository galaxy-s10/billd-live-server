import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IArea, IList } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op, col } = Sequelize;

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
                exclude: ['rtmp_url', 'key'],
              },
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
              ],
            },
          ],
        },
      ],
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
