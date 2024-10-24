import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { DeskConfigEnum, IDeskConfig, IList } from '@/interface';
import deskConfigModel from '@/model/deskConfig.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class DeskConfigService {
  /** desk配置是否存在 */
  async isExist(ids: number[]) {
    const res = await deskConfigModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取desk配置列表 */
  async getList({
    id,
    type,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IDeskConfig>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      type,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: [
        'field_a',
        'field_b',
        'field_c',
        'field_d',
        'field_e',
        'field_f',
        'field_g',
        'remark',
      ],
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
    const result = await deskConfigModel.findAndCountAll({
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

  /** 查找desk配置 */
  async find(id: number) {
    const result = await deskConfigModel.findOne({
      where: { id },
    });
    return result;
  }

  /** 查找desk配置 */
  async findByType(type: DeskConfigEnum) {
    const result = await deskConfigModel.findAll({
      where: { type },
    });
    return result;
  }

  /** 修改desk配置 */
  async update(data: IDeskConfig) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await deskConfigModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建desk配置 */
  async create(data: IDeskConfig) {
    const result = await deskConfigModel.create(data);
    return result;
  }

  /** 删除desk配置 */
  async delete(id: number) {
    const result = await deskConfigModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new DeskConfigService();
