import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { GoodsTypeEnum, IGoods, IList } from '@/interface';
import goodsModel from '@/model/goods.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class GoodsService {
  /** 商品是否存在 */
  async isExist(ids: number[]) {
    const res = await goodsModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取商品列表 */
  async getList({
    id,
    name,
    type,
    desc,
    short_desc,
    badge,
    badge_bg,
    remark,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IGoods>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      type,
      desc,
      short_desc,
      badge,
      badge_bg,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'short_desc', 'badge', 'badge_bg', 'remark'],
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
    const result = await goodsModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找商品 */
  async find(id: number) {
    const result = await goodsModel.findOne({ where: { id } });
    return result;
  }

  /** 查找商品 */
  async findByType(type: GoodsTypeEnum) {
    const result = await goodsModel.findOne({ where: { type } });
    return result;
  }

  /** 修改商品 */
  async update(data: IGoods) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await goodsModel.update(data2, { where: { id }, limit: 1 });
    return result;
  }

  /** 创建商品 */
  async create(data: IGoods) {
    const result = await goodsModel.create(data);
    return result;
  }

  /** 删除商品 */
  async delete(id: number) {
    const result = await goodsModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new GoodsService();
