import { deleteUseLessObjectKey, filterObj, isPureNumber } from 'billd-utils';
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
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
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
          [
            literal(
              `(select weight from ${liveRoomModel.tableName}
                where ${liveRoomModel.tableName}.id = ${livePlayModel.tableName}.live_room_id)`
            ),
            'live_room_weight',
          ],
        ],
      },
      order: [[literal('live_room_weight'), 'desc'], ...orderRes],
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
  async update(data: ILivePlay) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await livePlayModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建直播 */
  async create(data: ILivePlay) {
    const result = await livePlayModel.create(data);
    return result;
  }

  /** 删除直播 */
  async delete(id: number) {
    const result = await livePlayModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }

  /** 更新结束时间 */
  updateEndTime = async (data: {
    live_room_id: number;
    user_id?: number;
    random_id?: string;
    srs_client_id: string;
    srs_ip: string;
    end_time: string;
  }) => {
    const lastData = await livePlayModel.findOne({
      order: [['created_at', 'desc']],
      where: deleteUseLessObjectKey({
        live_room_id: data.live_room_id,
        user_id: data.user_id,
        random_id: data.random_id,
        srs_client_id: data.srs_client_id,
        srs_ip: data.srs_ip,
      }),
    });
    let flag = true;
    if (lastData) {
      await livePlayModel.update(
        {
          end_time: data.end_time,
        },
        {
          where: {
            id: lastData.id,
          },
        }
      );
    } else {
      flag = false;
    }
    return flag;
  };
}

export default new LivePlayService();
