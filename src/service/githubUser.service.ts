import Sequelize from 'sequelize';

import { IGithubUser, IList } from '@/interface';
import githubUserModel from '@/model/githubUser.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class UserService {
  /** github用户是否存在 */
  async isExist(github_ids: number[]) {
    const res = await githubUserModel.count({
      where: {
        github_id: {
          [Op.in]: github_ids,
        },
      },
    });
    return res === github_ids.length;
  }

  /** 获取github用户列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    // created_at,
    // updated_at,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IGithubUser>) {
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
          login: {
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
    // if (created_at) {
    //   allWhere.created_at = {
    //     [Op.between]: [created_at, `${created_at} 23:59:59`],
    //   };
    // }
    // if (updated_at) {
    //   allWhere.updated_at = {
    //     [Op.between]: [updated_at, `${updated_at} 23:59:59`],
    //   };
    // }
    // @ts-ignore
    const result = await githubUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据github_id查找github用户 */
  async findByGithubId(github_id: any) {
    const result = await githubUserModel.findOne({ where: { github_id } });
    return result;
  }

  /** 修改github用户 */
  async update(props: IGithubUser) {
    const result = await githubUserModel.update(
      {
        ...props,
        id: undefined,
      },
      { where: { id: props.id } }
    );
    return result;
  }

  /** 根据github_id修改github用户 */
  async updateByGithubId(props: IGithubUser) {
    const result = await githubUserModel.update(
      {
        ...props,
        github_id: undefined,
      },
      { where: { github_id: props.github_id } }
    );
    return result;
  }

  /** 创建github用户 */
  async create(props) {
    const result = await githubUserModel.create(props);
    return result;
  }

  /** 根据id查找github用户 */
  async find(id: number) {
    const result = await githubUserModel.findOne({ where: { id } });
    return result;
  }

  /** 删除github用户 */
  async delete(id: number) {
    const result = await githubUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new UserService();
