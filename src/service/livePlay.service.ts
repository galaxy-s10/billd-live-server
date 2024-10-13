import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op, literal } from 'sequelize';

import { IList, ILivePlay } from '@/interface';
import areaModel from '@/model/area.model';
import livePlayModel from '@/model/livePlay.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

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
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      random_id,
      user_id,
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
    const orderRes = handleOrder({ orderName, orderBy });
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
              `(select priority from ${liveRoomModel.tableName}
                where ${liveRoomModel.tableName}.id = ${livePlayModel.tableName}.live_room_id)`
            ),
            'live_room_priority',
          ],
        ],
      },
      order: [[literal('live_room_priority'), 'desc'], ...orderRes],
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
    const allWhere: any = deleteUseLessObjectKey({
      live_room_id,
      user_id,
      random_id,
    });
    const rangTimeType = 'created_at';
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType] = rangTimeWhere;
    }
    const result = await livePlayModel.findAll({
      where: {
        ...allWhere,
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
