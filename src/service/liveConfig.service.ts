import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ILiveConfig } from '@/interface';
import liveConfigModel from '@/model/liveConfig.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

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
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['key', 'value', 'desc'],
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
    const result = await liveConfigModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  async delete(id: number) {
    const result = await liveConfigModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveConfigService();
