import Sequelize from 'sequelize';

import { IBlacklist, IList } from '@/interface';
import blacklistModel from '@/model/blacklist.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LinkService {
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
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IBlacklist>) {
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
          ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          user_id: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          msg: {
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
    const result = await blacklistModel.findAndCountAll({
      order: [[orderName, orderBy]],
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
  async findByIp(ip: string) {
    const result = await blacklistModel.findOne({ where: { ip } });
    return result;
  }

  /** 修改黑名单 */
  async update({ id, user_id, ip, msg, type }: IBlacklist) {
    const result = await blacklistModel.update(
      { user_id, ip, msg, type },
      { where: { id } }
    );
    return result;
  }

  /** 创建黑名单 */
  async create({ user_id, ip, msg, type }: IBlacklist) {
    const result = await blacklistModel.create({
      user_id,
      ip,
      msg,
      type,
    });
    return result;
  }

  /** 删除黑名单 */
  async delete(id: number) {
    const result = await blacklistModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LinkService();
