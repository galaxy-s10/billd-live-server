import { filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import { IThirdUser } from '@/types/IUser';
import { handlePaging } from '@/utils';

class ThirdUserService {
  /** 第三方用户记录是否存在 */
  async isExist(ids: number[]) {
    const res = await thirdUserModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取第三方用户记录列表 */
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
  }: IList<IThirdUser>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id) {
      allWhere.id = id;
    }
    if (keyWord) {
      const keyWordWhere = [];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const result = await thirdUserModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找第三方用户记录 */
  async find(id: number) {
    const result = await thirdUserModel.findOne({ where: { id } });
    return result;
  }

  /** 根据third_platform和third_user_id查找第三方用户表里的记录 */
  async findUser({ third_platform, third_user_id }) {
    const result = await thirdUserModel.findOne({
      where: { third_platform, third_user_id },
    });
    return result;
  }

  /** 根据third_user_id查找第三方用户表里的记录 */
  async findUserByThirdUserId(third_user_id) {
    const result = await thirdUserModel.findOne({
      where: { third_user_id },
    });
    return result;
  }

  /** 根据user_id查找第三方用户表里的记录 */
  async findByUserId(user_id: number) {
    const result = await thirdUserModel.findAll({
      where: { user_id },
    });
    return result;
  }

  /** 修改第三方用户记录 */
  async update(data: IThirdUser) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await thirdUserModel.update(data2, { where: { id } });
    return result;
  }

  /** 创建第三方用户记录 */
  async create(data: IThirdUser) {
    const result = await thirdUserModel.create(data);
    return result;
  }

  /** 删除第三方用户记录 */
  async delete(id: number) {
    const result = await thirdUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new ThirdUserService();
