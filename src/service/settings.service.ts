import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ISettings } from '@/interface';
import settingsModel from '@/model/settings.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

const { Op } = Sequelize;

class SettingsService {
  async isExist(ids: number[]) {
    const res = await settingsModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async find(id: number) {
    const result = await settingsModel.findOne({ where: { id } });
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
  }: IList<ISettings>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['email'],
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
    const result = await settingsModel.findAndCountAll({
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
    const result = await settingsModel.findAll();
    return result;
  }

  async create(data: ISettings) {
    const result = await settingsModel.create(data);
    return result;
  }

  async update(data: ISettings) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await settingsModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  async delete(id: number) {
    const result = await settingsModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new SettingsService();
