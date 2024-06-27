import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import deskUserModel from '@/model/deskUser.model';
import { IDeskUser } from '@/types/IUser';
import { handlePaging } from '@/utils';

class DeskUserService {
  /** desk用户是否存在 */
  async isExist(ids: number[]) {
    const res = await deskUserModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取desk用户列表 */
  async getList({
    id,
    uuid,
    status,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IDeskUser>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      uuid,
      status,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          uuid: {
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
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    // @ts-ignore
    const result = await deskUserModel.findAndCountAll({
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

  /** 查找desk用户 */
  async find(id: number) {
    const result = await deskUserModel.findOne({
      where: { id },
    });
    return result;
  }

  /** 查找desk用户 */
  async findByUuid(uuid: string) {
    const result = await deskUserModel.findOne({
      where: { uuid },
    });
    return result;
  }

  /** 修改desk用户 */
  async update(data: IDeskUser) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await deskUserModel.update(data2, { where: { id } });
    return result;
  }

  /** 修改desk用户 */
  async updateByUuid(data: IDeskUser) {
    const { uuid } = data;
    const data2 = filterObj(data, ['id', 'uuid']);
    const result = await deskUserModel.update(data2, {
      where: { uuid },
      limit: 1,
    });
    return result;
  }

  /** 创建desk用户 */
  async create(data: IDeskUser) {
    const result = await deskUserModel.create(data);
    return result;
  }

  /** 删除desk用户 */
  async delete(id: number) {
    const result = await deskUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new DeskUserService();
