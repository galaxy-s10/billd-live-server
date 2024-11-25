import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { literal, Op } from 'sequelize';

import { IList, ILiveView } from '@/interface';
import liveViewModel from '@/model/liveView.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveViewService {
  /** 记录是否存在 */
  async isExist(ids: number[]) {
    const res = await liveViewModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取记录列表 */
  async getList({
    id,
    live_record_id,
    live_room_id,
    user_id,
    duration,
    user_agent,
    client_ip,
    client_env,
    remark,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    childKeyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveView>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['client_ip', 'user_agent', 'remark'],
    });
    const childWhere = {};
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    if (childKeyWord) {
      childWhere[Op.or] = handleKeyWord({
        keyWord: childKeyWord,
        arr: ['username', 'desc'],
      });
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    const orderRes = handleOrder({ orderName, orderBy });
    const result = await liveViewModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          where: { ...childWhere },
        },
      ],
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async updateDuration({
    live_room_id,
    live_record_id,
    user_id,
    duration,
  }: ILiveView) {
    // async function main() {
    //   const result = await liveViewModel.update(
    //     { duration: literal(`\`duration\` +${duration!}`) },
    //     {
    //       where: { id },
    //       limit: 1,
    //     }
    //   );
    //   return result;
    // }
    // return catchSequelizeError(main());
    try {
      const result = await liveViewModel.update(
        // eslint-disable-next-line
        { duration: literal('`duration` +' + duration) },
        {
          where: { live_room_id, live_record_id, user_id },
          limit: 1,
        }
      );
      return result;
    } catch (error) {
      console.log(error);
      throw new Error('');
    }
  }

  async getCountByLiveRecordId(live_record_id: number) {
    const result = await liveViewModel.count({ where: { live_record_id } });
    return result;
  }

  /** 查找记录 */
  async find(id: number) {
    const result = await liveViewModel.findOne({ where: { id } });
    return result;
  }

  /** 修改记录 */
  async update(data: ILiveView) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveViewModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建记录 */
  async create(data: ILiveView) {
    const result = await liveViewModel.create(data);
    return result;
  }

  /** 删除记录 */
  async delete(id: number) {
    const result = await liveViewModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveViewService();
