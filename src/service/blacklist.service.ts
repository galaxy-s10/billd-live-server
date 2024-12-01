import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IBlacklist, IList } from '@/interface';
import blacklistModel from '@/model/blacklist.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class BlackListService {
  /** 黑名单是否存在 */
  async isExist(ids: number[]) {
    const res = await blacklistModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取黑名单列表 */
  async getList({
    id,
    user_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IBlacklist>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['client_ip', 'msg'],
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
    const result = await blacklistModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找黑名单 */
  async find(id: number) {
    const result = await blacklistModel.findOne({ where: { id } });
    return result;
  }

  /** 根据ip查找黑名单 */
  async findByIp(client_ip: string) {
    const result = await blacklistModel.findOne({ where: { client_ip } });
    return result;
  }

  /** 修改黑名单 */
  async update(data: IBlacklist) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await blacklistModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建黑名单 */
  async create(data: IBlacklist) {
    const result = await blacklistModel.create(data);
    return result;
  }

  /** 删除黑名单 */
  async delete(id: number) {
    const result = await blacklistModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new BlackListService();
