import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IDeskVersion, IList } from '@/interface';
import deskVersionModel from '@/model/deskVersion.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class DeskVersionService {
  /** desk版本是否存在 */
  async isExist(ids: number[]) {
    const res = await deskVersionModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取desk版本列表 */
  async getList({
    id,
    version,
    disable,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IDeskVersion>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      version,
      disable,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: [
        'version',
        'show_version',
        'update_content',
        'disable_msg',
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
    const result = await deskVersionModel.findAndCountAll({
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

  /** 查找desk版本 */
  async find(id: number) {
    const result = await deskVersionModel.findOne({
      where: { id },
    });
    return result;
  }

  /** 查找desk版本 */
  async findByVersion(version: string) {
    const result = await deskVersionModel.findOne({
      where: { version },
    });
    return result;
  }

  /** 修改desk版本 */
  async update(data: IDeskVersion) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await deskVersionModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建desk版本 */
  async create(data: IDeskVersion) {
    const result = await deskVersionModel.create(data);
    return result;
  }

  /** 删除desk版本 */
  async delete(id: number) {
    const result = await deskVersionModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new DeskVersionService();
