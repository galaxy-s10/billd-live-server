import { isPureNumber } from 'billd-utils';
import { Op, literal } from 'sequelize';

import { IList, ILivePlay } from '@/interface';
import areaModel from '@/model/area.model';
import livePlayModel from '@/model/livePlay.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class LivePlayService {
  /** 直播是否存在 */
  async isExist(ids: number[]) {
    const res = await livePlayModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播列表 */
  async getList({
    id,
    live_room_id,
    user_id,
    random_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILivePlay>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id !== undefined && isPureNumber(`${id}`)) {
      allWhere.id = id;
    }
    if (random_id !== undefined) {
      allWhere.random_id = random_id;
    }
    if (user_id !== undefined && isPureNumber(`${user_id}`)) {
      allWhere.user_id = user_id;
    }
    if (live_room_id !== undefined && isPureNumber(`${live_room_id}`)) {
      allWhere.live_room_id = live_room_id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          srs_client_id: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          srs_stream: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          srs_stream_url: {
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
    const result = await livePlayModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
        {
          model: liveRoomModel,
          attributes: {
            exclude: ['key'],
          },
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      attributes: {
        exclude: ['key'],
        include: [
          [
            literal(
              `(select weight from ${liveRoomModel.tableName}
                where ${liveRoomModel.tableName}.id = ${livePlayModel.tableName}.live_room_id)`
            ),
            'live_room_weight',
          ],
        ],
      },
      order: [
        [literal('live_room_weight'), 'desc'],
        [orderName, orderBy],
      ],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILivePlay>(result, nowPage, pageSize);
  }

  /** 查找直播 */
  async find(id: number) {
    const result = await livePlayModel.findOne({ where: { id } });
    return result;
  }

  /** 查找直播 */
  async findAll({
    live_room_id,
    user_id,
    random_id,
    rangTimeStart,
    rangTimeEnd,
  }) {
    const result = await livePlayModel.findAll({
      where: {
        live_room_id,
        user_id,
        random_id,
        created_at: {
          [Op.gt]: new Date(+rangTimeStart),
          [Op.lt]: new Date(+rangTimeEnd),
        },
      },
    });
    return result;
  }

  /** 修改直播 */
  async update({
    id,
    live_room_id,
    user_id,
    random_id,
    srs_action,
    srs_app,
    srs_client_id,
    srs_ip,
    srs_param,
    srs_server_id,
    srs_service_id,
    srs_stream,
    srs_stream_id,
    srs_stream_url,
    srs_tcUrl,
    srs_vhost,
  }: ILivePlay) {
    const result = await livePlayModel.update(
      {
        live_room_id,
        user_id,
        random_id,
        srs_action,
        srs_app,
        srs_client_id,
        srs_ip,
        srs_param,
        srs_server_id,
        srs_service_id,
        srs_stream,
        srs_stream_id,
        srs_stream_url,
        srs_tcUrl,
        srs_vhost,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建直播 */
  async create({
    live_room_id,
    user_id,
    random_id,
    srs_action,
    srs_app,
    srs_client_id,
    srs_ip,
    srs_param,
    srs_server_id,
    srs_service_id,
    srs_stream,
    srs_stream_id,
    srs_stream_url,
    srs_tcUrl,
    srs_vhost,
  }: ILivePlay) {
    const result = await livePlayModel.create({
      live_room_id,
      user_id,
      random_id,
      srs_action,
      srs_app,
      srs_client_id,
      srs_ip,
      srs_param,
      srs_server_id,
      srs_service_id,
      srs_stream,
      srs_stream_id,
      srs_stream_url,
      srs_tcUrl,
      srs_vhost,
    });
    return result;
  }

  /** 删除直播 */
  async delete(id: number) {
    const result = await livePlayModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }

  /** 删除直播 */
  deleteByLiveRoomIdAndUserId = async (data: {
    live_room_id: number;
    user_id: number;
    srs_client_id: string;
    srs_ip: string;
  }) => {
    const res = await livePlayModel.destroy({
      where: {
        live_room_id: data.live_room_id,
        user_id: data.user_id,
        srs_client_id: data.srs_client_id,
        srs_ip: data.srs_ip,
      },
    });
    return res;
  };

  /** 删除直播 */
  deleteByLiveRoomIdAndRandomId = async (data: {
    live_room_id: number;
    random_id: string;
    srs_client_id: string;
    srs_ip: string;
  }) => {
    const res = await livePlayModel.destroy({
      where: {
        live_room_id: data.live_room_id,
        random_id: data.random_id,
        srs_client_id: data.srs_client_id,
        srs_ip: data.srs_ip,
      },
    });
    return res;
  };
}

export default new LivePlayService();
