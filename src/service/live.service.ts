import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, ILive } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

export async function handleDelRedisByDbLiveList() {
  try {
    await redisController.delByPrefix({
      prefix: REDIS_PREFIX.dbLiveList,
    });
  } catch (error) {
    console.log(error);
  }
}

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
  async getPureList({
    id,
    live_room_id,
    socket_id,
    track_audio,
    track_video,
    flag_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_room_id,
      socket_id,
      track_audio,
      track_video,
      flag_id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['srs_client_id', 'srs_stream', 'srs_stream_url'],
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
    const result = await liveModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging<ILive>(result, nowPage, pageSize);
  }

  /** 获取直播列表 */
  async getList({
    id,
    is_tencentcloud_css,
    live_room_id,
    cdn,
    is_fake,
    is_show,
    status,
    childOrderName,
    childOrderBy,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive & ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      is_tencentcloud_css,
      live_room_id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['srs_client_id', 'srs_stream', 'srs_stream_url'],
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
    const subWhere = deleteUseLessObjectKey({
      cdn,
      is_fake,
      is_show,
      status,
    });
    const orderRes = handleOrder({ orderName, orderBy });
    const childOrderRes = handleOrder(
      { orderName: childOrderName, orderBy: childOrderBy },
      liveRoomModel
    );
    const result = await liveModel.findAndCountAll({
      include: [
        {
          model: liveRoomModel,
          attributes: {
            exclude: [
              'key',
              'push_rtmp_url',
              'push_obs_server',
              'push_obs_stream_key',
              'push_webrtc_url',
              'push_srt_url',
              'cdn_push_rtmp_url',
              'cdn_push_obs_server',
              'cdn_push_obs_stream_key',
              'cdn_push_webrtc_url',
              'cdn_push_srt_url',
              'forward_bilibili_url',
              'forward_huya_url',
              'forward_douyu_url',
              'forward_douyin_url',
              'forward_kuaishou_url',
              'forward_xiaohongshu_url',
            ],
          },
          include: [
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
              through: {
                attributes: [],
              },
            },
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
          // where: {
          //   ...subWhere,
          // },
        },
      ],
      // 不能设置attributes: [],否则orderRes排序的时候，没有order字段就会报错
      // attributes: ['created_at'],
      // attributes: [],
      order: [...orderRes, ...childOrderRes],
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

  liveRoomisLive = async (live_room_id: number) => {
    const res = await liveModel.findOne({
      include: [
        {
          model: liveRoomModel,
          attributes: {
            exclude: [
              'key',
              'push_rtmp_url',
              'push_obs_server',
              'push_obs_stream_key',
              'push_webrtc_url',
              'push_srt_url',
              'cdn_push_rtmp_url',
              'cdn_push_obs_server',
              'cdn_push_obs_stream_key',
              'cdn_push_webrtc_url',
              'cdn_push_srt_url',
              'forward_bilibili_url',
              'forward_huya_url',
              'forward_douyu_url',
              'forward_douyin_url',
              'forward_kuaishou_url',
              'forward_xiaohongshu_url',
            ],
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
      where: { live_room_id },
    });
    return res;
  };

  /** 修改直播 */
  async update(data: ILive) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveModel.update(data2, { where: { id }, limit: 1 });
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 修改直播 */
  async updateByRoomId({
    socket_id,
    live_room_id,
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
    is_tencentcloud_css,
    flag_id,
  }: ILive) {
    const result = await liveModel.update(
      {
        socket_id,
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
        is_tencentcloud_css,
        flag_id,
      },
      { where: { live_room_id } }
    );
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 创建直播 */
  async create(data: ILive) {
    const result = await liveModel.create(data);
    handleDelRedisByDbLiveList();
    return result;
  }

  /** 删除直播 */
  async delete(id: number | number[]) {
    const result = await liveModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    handleDelRedisByDbLiveList();
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
    handleDelRedisByDbLiveList();
    return res;
  };

  /** 删除直播 */
  deleteByLiveRoomId = async (live_room_id: number | number[]) => {
    const res = await liveModel.destroy({ where: { live_room_id } });
    handleDelRedisByDbLiveList();
    return res;
  };

  /** 删除直播 */
  deleteBySocketId = async (socket_id: string) => {
    const res = await liveModel.destroy({ where: { socket_id } });
    handleDelRedisByDbLiveList();
    return res;
  };
}

export default new LiveService();
