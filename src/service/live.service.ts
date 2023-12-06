import { isPureNumber } from 'billd-utils';
import { Op, literal } from 'sequelize';

import { IList, ILive } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class LiveService {
  /** 直播是否存在 */
  async isExist(ids: number[]) {
    const res = await liveModel.count({
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
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive>) {
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
    if (live_room_id !== undefined && isPureNumber(`${live_room_id}`)) {
      allWhere.live_room_id = live_room_id;
    }
    if (user_id !== undefined && isPureNumber(`${user_id}`)) {
      allWhere.user_id = user_id;
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
    const result = await liveModel.findAndCountAll({
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
                where ${liveRoomModel.tableName}.id = ${liveModel.tableName}.live_room_id)`
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
    return handlePaging<ILive>(result, nowPage, pageSize);
  }

  /** 查找直播 */
  async find(id: number) {
    const result = await liveModel.findOne({ where: { id } });
    return result;
  }

  /** 查找直播 */
  async findAllLiveByRoomId(live_room_id: number) {
    const result = await liveModel.findAll({ where: { live_room_id } });
    return result;
  }

  /** 查找直播 */
  findBySocketId = async (socket_id: string) => {
    const res = await liveModel.findAndCountAll({ where: { socket_id } });
    return res;
  };

  /** 查找直播（禁止对外。） */
  findByLiveRoomId = async (live_room_id: number) => {
    const res = await liveModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
        {
          model: liveRoomModel,
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
      where: { live_room_id },
    });
    return res;
  };

  /** 修改直播 */
  async update({
    id,
    socket_id,
    live_room_id,
    user_id,
    track_audio,
    track_video,
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
  }: ILive) {
    const result = await liveModel.update(
      {
        socket_id,
        live_room_id,
        user_id,
        track_audio,
        track_video,
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

  /** 修改直播 */
  async updateByRoomId({
    socket_id,
    live_room_id,
    user_id,
    track_audio,
    track_video,
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
  }: ILive) {
    const result = await liveModel.update(
      {
        socket_id,
        user_id,
        track_audio,
        track_video,
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
      { where: { live_room_id } }
    );
    return result;
  }

  /** 创建直播 */
  async create({
    socket_id,
    live_room_id,
    user_id,
    track_audio,
    track_video,
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
  }: ILive) {
    const result = await liveModel.create({
      socket_id,
      live_room_id,
      user_id,
      track_audio,
      track_video,
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
    const result = await liveModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }

  /** 删除直播 */
  deleteByLiveRoomIdAndSocketId = async (data: {
    live_room_id: number;
    socket_id: string;
  }) => {
    const res = await liveModel.destroy({
      where: { live_room_id: data.live_room_id, socket_id: data.socket_id },
    });
    return res;
  };

  /** 删除直播 */
  deleteByLiveRoomId = async (live_room_id: number) => {
    const res = await liveModel.destroy({ where: { live_room_id } });
    return res;
  };

  /** 删除直播 */
  deleteBySocketId = async (socket_id: string) => {
    const res = await liveModel.destroy({ where: { socket_id } });
    return res;
  };
}

export default new LiveService();
