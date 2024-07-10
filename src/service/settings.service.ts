import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ISettings } from '@/interface';
import settingsModel from '@/model/settings.model';
import { handlePaging } from '@/utils';

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
          email: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    // @ts-ignore
    const result = await settingsModel.findAndCountAll({
      order: [[orderName, orderBy]],
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
    const result = await settingsModel.update(data2, { where: { id } });
    return result;
  }

  async delete(id: number) {
    const result = await settingsModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new SettingsService();
