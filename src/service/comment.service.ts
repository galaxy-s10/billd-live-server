import Sequelize from 'sequelize';

import { IComment, IList } from '@/interface';
import commentModel from '@/model/comment.model';
import roleModel from '@/model/role.model';
import starModel from '@/model/star.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class CommentService {
  /** 评论是否存在 */
  async isExist(ids: number[]) {
    const res = await commentModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取评论列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    status,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IComment>) {
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
    if (status) {
      allWhere.status = +status;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          content: {
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
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      include: [
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
        },
      ],
      limit,
      offset,
      where: { ...allWhere },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 文章评论列表 */
  async getArticleCommentList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    status,
    from_user_id,
    article_id,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IComment>) {
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
    if (article_id) {
      allWhere.article_id = +article_id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          content: {
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
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          order: [['created_at', 'ASC']],
          model: commentModel,
          required: false,
          as: 'children_comment',
          include: [
            {
              model: starModel,
              // as: 'all_star',

              required: false,
              include: [
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'from_user',
                },
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'to_user',
                },
              ],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'from_user',
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'to_user',
            },
          ],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
        },
      ],
      distinct: true,
      where: {
        article_id,
        status,
        ...allWhere,
      },
      // attributes: {
      //   include: [
      //     [
      //       literal(
      //         `(select count(*) from star where comment_id = comment.id)`
      //       ),
      //       'star_total',
      //     ],
      //     [
      //       literal(
      //         `(select count(*) from star where comment_id = comment.id and from_user_id = ${from_user_id})`
      //       ),
      //       'is_star',
      //     ],
      //   ],
      // },
    });
    const total = await commentModel.count({
      where: {
        article_id,
        status,
      },
    });
    const promiseTotalRes: any = [];
    result.rows.forEach((v) => {
      promiseTotalRes.push(
        new Promise((resolve) => {
          starModel
            .count({
              where: {
                article_id,
                comment_id: v.id,
                to_user_id: v.from_user_id,
              },
            })
            .then((res) => {
              resolve({ res, comment_id: v.id });
            });
        }),
        new Promise((resolve) => {
          // @ts-ignore
          starModel
            .count({
              where: {
                article_id,
                comment_id: v.id,
                from_user_id,
              },
            })
            .then((res) => {
              // @ts-ignore
              resolve({ res, comment_id: v.id, judgeStar: true });
            });
        })
      );
    });
    const totalRes = await Promise.all(promiseTotalRes);
    const lastRes: any = [];
    result.rows.forEach((v) => {
      const obj: any = {
        ...v.get(),
        // @ts-ignore
        star_total: totalRes.find((x) => !x.judgeStar && x.comment_id === v.id)
          .res,
        // @ts-ignore
        is_star: totalRes.find((x) => x.judgeStar && x.comment_id === v.id).res,
      };
      lastRes.push(obj);
    });
    return {
      ...handlePaging({ ...result, rows: lastRes }, nowPage, pageSize),
      total,
    };
  }

  /** 留言板评论列表 */
  async getCommentList({
    article_id,
    childrenPageSize,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    from_user_id,
    status,
  }) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const result: any = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: starModel,
          attributes: ['id'],
        },
        {
          model: starModel,
          as: 'is_star',
          attributes: ['id'],
          where: {
            from_user_id,
          },
          required: false,
        },
        {
          model: commentModel,
          as: 'children_comment',
          attributes: {
            include: [],
          },
          include: [
            {
              model: starModel,
              attributes: ['id'],
            },
            {
              model: starModel,
              as: 'is_star',
              attributes: ['id'],
            },
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
              as: 'from_user',
            },
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
              as: 'to_user',
            },
            {
              model: commentModel,
              as: 'reply_comment',
              paranoid: false,
            },
          ],
          limit: parseInt(childrenPageSize, 10),
          order: [[orderName, orderBy]],
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          as: 'from_user',
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          as: 'to_user',
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
      ],
      where: {
        article_id,
        parent_comment_id: -1,
        status,
      },
      attributes: {
        include: [],
      },
      distinct: true,
    });
    const total = await commentModel.count({
      where: {
        article_id,
        status,
      },
    });
    result.rows.forEach((item) => {
      const v = item.get();
      v.is_star_id = v.is_star?.id || null;
      v.is_star = Boolean(v.is_star);
      delete v.stars;

      item.children_comment.forEach((child) => {
        const children = child.get();
        children.is_star_id = children.is_star?.id;
        children.is_star = Boolean(children.is_star);
        delete children.stars;
      });
    });
    return {
      ...handlePaging(result, nowPage, pageSize),
      total,
      childrenPageSize: parseInt(childrenPageSize, 10),
    };
  }

  /** 子级评论列表 */
  async getChildrenCommentList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    from_user_id,
    parent_comment_id,
    article_id,
    status,
  }) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
          include: [{ model: roleModel, through: { attributes: [] } }],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
          include: [{ model: roleModel, through: { attributes: [] } }],
        },
        {
          model: starModel,
          as: 'is_star',
          attributes: ['id'],
          where: {
            from_user_id,
          },
          required: false,
        },
        {
          model: commentModel,
          as: 'reply_comment',
          paranoid: false,
        },
      ],
      where: { status, article_id, parent_comment_id },
    });

    result.rows.forEach((item) => {
      const v: any = item.get();
      v.is_star_id = v.is_star?.id || null;
      v.is_star = v.is_star !== null;
      delete v.stars;
    });
    return {
      ...handlePaging(result, nowPage, pageSize),
    };
  }

  /** 查找评论 */
  async find(id: number) {
    const result = await commentModel.findOne({ where: { id } });
    return result;
  }

  /** 查找所有子评论 */
  async findAllChildren(parent_comment_id: number) {
    const result = await commentModel.findAndCountAll({
      where: { parent_comment_id },
    });
    return result;
  }

  /** 修改评论 */
  async update(props: IComment) {
    const result = await commentModel.update(
      { ...props, id: undefined },
      { where: { id: props.id } }
    );
    return result;
  }

  /** 创建评论 */
  async create({
    article_id,
    from_user_id,
    to_user_id,
    parent_comment_id,
    reply_comment_id,
    content,
    ua,
    ip,
    ip_data,
  }: IComment) {
    const result = await commentModel.create({
      article_id,
      from_user_id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
      ua,
      ip,
      ip_data,
    });
    if (parent_comment_id !== -1) {
      const total = await commentModel.count({
        where: { parent_comment_id },
      });
      await commentModel.update(
        // 如果新增的评论是在子评论，则需要将父评论的children_comment_total
        // { children_comment_total: literal('`children_comment_total` +1') },
        { children_comment_total: total },
        {
          where: { id: parent_comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }

    return result;
  }

  /** 删除多个评论 */
  async deleteMany(ids: number[]) {
    const result = await commentModel.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return result;
  }

  /** 删除评论 */
  async delete(id: number) {
    const res: any = await this.find(id);
    const result = await commentModel.destroy({
      where: { id },
      individualHooks: true,
    });
    if (res.parent_comment_id !== -1) {
      const total = await commentModel.count({
        where: { parent_comment_id: res.parent_comment_id },
      });
      await commentModel.update(
        // 如果删除的是父评论下面的子评论，则需要将父评论的children_comment_total-1
        // { children_comment_total: literal('`children_comment_total` -1') },
        { children_comment_total: total },
        {
          where: { id: res.parent_comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }
    return result;
  }
}

export default new CommentService();
