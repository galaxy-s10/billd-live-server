import { deleteUseLessObjectKey, filterObj, isPureNumber } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveRoomService {
  /** 直播间是否存在 */
  async isExist(ids: number[]) {
    const res = await liveRoomModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播间列表 */
  async getList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    pull_is_should_auth,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    if (
      pull_is_should_auth !== undefined &&
      isPureNumber(`${pull_is_should_auth}`)
    ) {
      allWhere.pull_is_should_auth = pull_is_should_auth;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
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
    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: { attributes: [] },
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: { attributes: [] },
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
        // include: [
        //   [col('user_live_room.id'), 'idd'],
        //   [col('user_live_room.user.id'), 'user_id'],
        //   [col('user_live_room.user.username'), 'user_username'],
        //   [col('user_live_room.user.avatar'), 'user_avatar'],
        // ],
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取直播间列表 */
  async getPureList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    pull_is_should_auth,
    exclude_key,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    if (
      pull_is_should_auth !== undefined &&
      isPureNumber(`${pull_is_should_auth}`)
    ) {
      allWhere.pull_is_should_auth = pull_is_should_auth;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
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
    const excludeArr = [
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
    ];
    if (exclude_key) {
      excludeArr.push('key');
    }
    const result = await liveRoomModel.findAndCountAll({
      attributes: {
        exclude: excludeArr,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找直播间 */
  async find(id: number) {
    const result = await liveRoomModel.findOne({
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
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
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
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findPure(id: number) {
    const result = await liveRoomModel.findOne({
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
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findByName(name: string) {
    const result = await liveRoomModel.findOne({
      include: [
        {
          model: userLiveRoomModel,
          include: [
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
            },
          ],
          required: true,
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
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
      },
      where: { name },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: [
        'key',
        'rtmp_url',
        'flv_url',
        'hls_url',
        'webrtc_url',
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
      where: { id },
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
    });
    return result;
  }

  /** 修改直播间 */
  async update(data: ILiveRoom) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveRoomModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建直播间 */
  async create(data: ILiveRoom) {
    const result = await liveRoomModel.create(data);
    return result;
  }

  /** 删除直播间 */
  async delete(id: number) {
    const result = await liveRoomModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomService();
