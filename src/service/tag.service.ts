import Sequelize from 'sequelize';

import { ITag, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class TagService {
  /** 标签是否存在 */
  async isExist(ids: number[]) {
    const res = await tagModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取标签列表 */
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
  }: IList<ITag>) {
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
          name: {
            [Op.like]: `%${keyWord}%`,
          },
          color: {
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
    const result = await tagModel.findAndCountAll({
      order: [[orderName, orderBy]],
      include: [
        {
          model: articleModel,
          through: {
            attributes: [],
          },
          attributes: ['id'],
        },
      ],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      distinct: true,
    });
    result.rows.forEach((item) => {
      const v: any = item.get();
      v.article_total = v.articles.length;
      delete v.articles;
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取标签文章列表 */
  async getArticleList({ tag_id, nowPage, pageSize }) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const inst = await tagModel.findOne({ where: { id: tag_id } });
    // @ts-ignore
    const count = await inst.countArticles();
    // @ts-ignore
    const result = await inst.getArticles({
      limit,
      offset,
      include: [
        {
          model: tagModel,
          through: {
            attributes: [],
          },
        },
        {
          model: commentModel,
          attributes: ['id'],
        },
        { model: starModel, attributes: ['id'] },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: ['content'],
      },
    });
    result.forEach((item) => {
      const v = item.get();
      v.star_total = v.stars.length;
      v.comment_total = v.comments.length;
      delete v.stars;
      delete v.comments;
    });
    return handlePaging({ rows: result, count }, nowPage, pageSize);
  }

  /** 查找标签 */
  async find(id: number) {
    const result = await tagModel.findOne({ where: { id } });
    return result;
  }

  /** 修改标签 */
  async update({ id, name, color }: ITag) {
    const result = await tagModel.update({ name, color }, { where: { id } });
    return result;
  }

  /** 创建标签 */
  async create({ name, color }: ITag) {
    const result = await tagModel.create({ name, color });
    return result;
  }

  /** 删除标签 */
  async delete(id: number) {
    const result = await tagModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new TagService();
