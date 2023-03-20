import Sequelize from 'sequelize';

import { IAuth, IList } from '@/interface';
import authModel from '@/model/auth.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class AuthService {
  /** 权限是否存在 */
  async isExist(ids: number[]) {
    const res = await authModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取权限列表(分页) */
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
  }: IList<IAuth>) {
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
          auth_name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          auth_value: {
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
    // @ts-ignore
    const result = await authModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      distinct: true,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取权限列表(不分页) */
  async getAllList() {
    const result = await authModel.findAndCountAll();
    return result;
  }

  /** 获取所有p_id不为null的权限 */
  async getPidNotNullAuth() {
    const result = await authModel.findAndCountAll({
      // @ts-ignore
      where: {
        p_id: {
          [Op.not]: null, // IS NOT NULL
          // [Op.not]: true, // IS NOT TRUE
        },
      },
    });
    return result;
  }

  /** 查找权限 */
  async find(id: number) {
    const result = await authModel.findOne({
      where: {
        id,
      },
    });
    return result;
  }

  /** 查找id为[a,b,c....]的权限 */
  async findAllByInId(ids: number[]) {
    const result = await authModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return result;
  }

  /** 根据p_id查找权限 */
  async findByPid(p_id: number) {
    const result = await authModel.findAll({
      where: {
        p_id,
      },
    });
    return result;
  }

  /** 修改权限 */
  async update({ id, p_id, auth_name, auth_value, type, priority }: IAuth) {
    const result = await authModel.update(
      {
        p_id,
        auth_name,
        auth_value,
        type,
        priority,
      },
      {
        where: {
          id,
        },
      }
    );
    return result;
  }

  /** 修改权限 */
  async updateMany(ids: number[], p_id: number) {
    const result = await authModel.update(
      {
        p_id,
      },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }
    );
    return result;
  }

  async findAllChildren(id: number) {
    const result = await authModel.findAll({
      where: {
        p_id: id,
      },
    });
    return result;
  }

  /** 创建权限 */
  async create({ p_id, auth_name, auth_value, type, priority }: IAuth) {
    const result = await authModel.create({
      p_id,
      auth_name,
      auth_value,
      type,
      priority,
    });
    return result;
  }

  /** 删除权限 */
  async delete(ids: number[]) {
    const result = await authModel.destroy({
      where: {
        id: {
          [Op.in]: ids, // [Op.in]的话，ids是[]，就一个也不会删。如果是[Op.or]，ids是[]，就会删除所有。
        },
      },
    });
    return result;
  }
}

export default new AuthService();
