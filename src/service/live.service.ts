import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op, col, literal } from 'sequelize';

import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, ILive } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import { handlePaging } from '@/utils';

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
  async getList({
    id,
    live_room_id,
    user_id,
    live_room_is_show,
    live_room_status,
    is_tencentcloud_css,
    is_fake,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILive & ILiveRoom>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_room_id,
      user_id,
      is_tencentcloud_css,
    });
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
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    const subWhere = deleteUseLessObjectKey({
      is_show: live_room_is_show,
      status: live_room_status,
      is_fake,
    });
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
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
          where: {
            ...subWhere,
          },
        },
      ],
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
        include: [
          // [
          //   literal(
          //     `(select priority from ${liveRoomModel.tableName}
          //       where ${liveRoomModel.tableName}.id = ${liveModel.tableName}.live_room_id)`
          //   ),
          //   'live_room_priority',
          // ],
          [col(`${liveRoomModel.tableName}.priority`), 'live_room_priority'],
          [col(`${liveRoomModel.tableName}.is_fake`), 'live_room_is_fake'],
        ],
      },
      order: [[literal('live_room_priority'), 'desc'], ...orderRes],
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

  liveRoomisLive = async (live_room_id: number) => {
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
    is_tencentcloud_css,
    flag_id,
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
