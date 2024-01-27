import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { GoodsTypeEnum, IGoods, IList } from '@/interface';
import goodsModel from '@/model/goods.model';
import { handlePaging } from '@/utils';

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
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IGoods>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      type,
      desc,
      short_desc,
      badge,
      badge_bg,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          short_desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
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
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
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
    const result = await goodsModel.update(data2, { where: { id } });
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
      individualHooks: true,
    });
    return result;
  }
}

export default new GoodsService();
