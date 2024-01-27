import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ILiveConfig } from '@/interface';
import liveConfigModel from '@/model/liveConfig.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LiveConfigService {
  async isExist(ids: number[]) {
    const res = await liveConfigModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async find(id: number) {
    const result = await liveConfigModel.findOne({ where: { id } });
    return result;
  }

  async findByKey(key: string) {
    const result = await liveConfigModel.findOne({ where: { key } });
    return result;
  }

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
  }: IList<ILiveConfig>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          key: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          value: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
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
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const result = await liveConfigModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async findAll() {
    const result = await liveConfigModel.findAll();
    return result;
  }

  async create(data: ILiveConfig) {
    const result = await liveConfigModel.create(data);
    return result;
  }

  async update(data: ILiveConfig) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveConfigModel.update(data2, { where: { id } });
    return result;
  }

  async delete(id: number) {
    const result = await liveConfigModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveConfigService();
