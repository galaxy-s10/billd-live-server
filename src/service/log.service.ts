import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, ILog } from '@/interface';
import logModel from '@/model/log.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LogService {
  /** 日志是否存在 */
  async isExist(ids: number[]) {
    const res = await logModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取日志列表 */
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
  }: IList<ILog>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: [
        'api_user_agent',
        'api_real_ip',
        'api_host',
        'api_hostname',
        'api_path',
      ],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
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
    const result = await logModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async getCount({ api_real_ip, startTime, endTime }) {
    const count = await logModel.count({
      where: {
        api_real_ip,
        created_at: {
          [Op.between]: [startTime, endTime],
        },
      },
    });
    return count;
  }

  /** 查找日志 */
  async find(id: number) {
    const result = await logModel.findOne({ where: { id } });
    return result;
  }

  /** 修改日志 */
  async update({
    id,
    user_id,
    api_user_agent,
    api_referer,
    api_forwarded_for,
    api_real_ip,
    api_host,
    api_hostname,
    api_method,
    api_path,
    api_query,
    api_body,
    api_status_code,
    api_error,
    api_err_code,
    api_err_msg,
    api_duration,
  }: ILog) {
    const result = await logModel.update(
      {
        id,
        user_id,
        api_user_agent,
        api_referer,
        api_forwarded_for,
        api_real_ip,
        api_host,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_status_code,
        api_error,
        api_err_code,
        api_err_msg,
        api_duration,
      },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 创建日志 */
  async create({
    user_id,
    api_user_agent,
    api_referer,
    api_forwarded_for,
    api_real_ip,
    api_host,
    api_hostname,
    api_method,
    api_path,
    api_query,
    api_body,
    api_status_code,
    api_error,
    api_err_code,
    api_err_msg,
    api_duration,
  }: ILog) {
    const result = await logModel.create({
      user_id,
      api_user_agent,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_status_code,
      api_error,
      api_err_code,
      api_err_msg,
      api_duration,
    });
    return result;
  }

  /** 删除90天前的日志 */
  async deleteRang() {
    const nowDate = new Date().getTime();
    const result = await logModel.destroy({
      where: {
        created_at: {
          [Op.lt]: new Date(nowDate - 1000 * 60 * 60 * 24 * 90),
        },
      },
      force: true, // WARN 不用软删除，直接硬性删除数据库的记录
      individualHooks: false,
    });
    return result;
  }

  /** 删除日志 */
  async delete(id: number) {
    const result = await logModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LogService();
