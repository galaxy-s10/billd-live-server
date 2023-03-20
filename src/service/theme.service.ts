import Sequelize from 'sequelize';

import { ITheme, IList } from '@/interface';
import themeModel from '@/model/theme.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class ThemeService {
  /** 主题是否存在 */
  async isExist(ids: number[]) {
    const res = await themeModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取主题列表 */
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
  }: IList<ITheme>) {
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
          key: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          value: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          model: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
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
    const result = await themeModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找主题 */
  async find(id: number) {
    const result = await themeModel.findOne({ where: { id } });
    return result;
  }

  /** 修改主题 */
  async update({ id, key, value, model, lang, desc }: ITheme) {
    const result = await themeModel.update(
      { key, value, model, lang, desc },
      { where: { id } }
    );
    return result;
  }

  /** 创建主题 */
  async create({ key, value, model, lang, desc }: ITheme) {
    const result = await themeModel.create({
      key,
      value,
      model,
      lang,
      desc,
    });
    return result;
  }

  /** 删除主题 */
  async delete(id: number) {
    const result = await themeModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new ThemeService();
