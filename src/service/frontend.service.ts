import Sequelize from 'sequelize';

import { IFrontend, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import frontendModel from '@/model/frontend.model';
import userModel from '@/model/user.model';
import VisitorLogModel from '@/model/visitorLog.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class FrontendService {
  /** 统计 */
  async static() {
    const [
      article_total,
      article_read_total,
      comment_total,
      user_total,
      visit_total,
    ] = await Promise.all([
      articleModel.count(),
      articleModel.sum('click'),
      commentModel.count(),
      userModel.count(),
      VisitorLogModel.count(),
    ]);
    return {
      user: {
        total: user_total,
      },
      article: {
        total: article_total,
        read: article_read_total,
      },
      comment: {
        total: comment_total,
      },
      visit: {
        total: visit_total,
      },
    };
  }

  async isExist(ids: number[]) {
    const res = await frontendModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async find(id: number) {
    const result = await frontendModel.findOne({ where: { id } });
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
  }: IList<IFrontend>) {
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
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await frontendModel.findAndCountAll({
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
    const result = await frontendModel.findAll();
    return result;
  }

  async create({ type, key, value, desc }: IFrontend) {
    const result = await frontendModel.create({
      type,
      key,
      value,
      desc,
    });
    return result;
  }

  /** 修改前端设置 */
  async update({ id, key, value, desc }: IFrontend) {
    const result = await frontendModel.update(
      {
        key,
        value,
        desc,
      },
      { where: { id } }
    );
    return result;
  }

  async delete(id: number) {
    const result = await frontendModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new FrontendService();
