import Sequelize from 'sequelize';

import { THIRD_PLATFORM } from '@/constant';
import { IEmail, IList } from '@/interface';
import emailModel from '@/model/emailUser.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class EmailService {
  /** 是否存在 */
  async isExist(ids: number[]) {
    const res = await emailModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 邮箱是否存在 */
  async emailsIsExist(emails: string[]) {
    const res = await emailModel.count({
      where: {
        email: {
          [Op.in]: emails,
        },
      },
    });
    return res === emails.length;
  }

  /** 获取邮箱用户列表 */
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
  }: IList<IEmail>) {
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
    const result = await emailModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据email在第三方用户里面找到对应的用户 */
  async findThirdUser(email: string) {
    const result = await emailModel.findOne({
      include: [
        {
          model: userModel,
          through: {
            attributes: [],
            where: {
              third_platform: THIRD_PLATFORM.email,
            },
          },
          attributes: {
            exclude: ['password', 'token'],
          },
        },
      ],
      where: { email },
    });
    return result;
  }

  /** 根据email查找邮箱用户 */
  async findByEmail(email: string) {
    const result = await emailModel.findOne({
      where: { email },
    });
    return result;
  }

  /** 根据id查找邮箱用户 */
  async findById(id: number) {
    const result = await emailModel.findOne({ where: { id } });
    return result;
  }

  /** 修改邮箱用户 */
  async update({ id, email }: IEmail) {
    const result = await emailModel.update({ email }, { where: { id } });
    return result;
  }

  /** 创建邮箱用户 */
  async create({ email }: IEmail) {
    const result = await emailModel.create({ email });
    return result;
  }

  /** 删除邮箱用户 */
  async delete(id: number) {
    const result = await emailModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new EmailService();
