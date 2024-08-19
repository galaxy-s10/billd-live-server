import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op, literal } from 'sequelize';

import { IArea, IList } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class AreaService {
  /** 分区是否存在 */
  async isExist(ids: number[]) {
    const res = await areaModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取分区列表 */
  async getList({
    id,
    name,
    remark,
    weight,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      remark,
      weight,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          remark: {
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
    // @ts-ignore
    const result = await areaModel.findAndCountAll({
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

  /** 获取分区直播间列表 */
  async getLiveRoomList({
    area_id,
    live_room_is_show,
    live_room_status,
    nowPage,
    pageSize,
  }) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const subWhere = deleteUseLessObjectKey({
      is_show: live_room_is_show,
      status: live_room_status,
    });
    const result = await liveRoomModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: areaModel,
          through: {
            attributes: [],
          },
          where: { id: area_id },
        },
        {
          model: liveModel,
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
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
      where: { ...subWhere },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取分区列表 */
  async getAreaLiveRoomList({
    id,
    live_room_status,
    live_room_is_show,
    name,
    remark,
    weight,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArea>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      remark,
      weight,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          remark: {
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
    });
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    // @ts-ignore
    const result = await areaModel.findAndCountAll({
      include: [
        {
          model: areaLiveRoomModel,
          limit: 4,
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
                  model: liveModel,
                },
                {
                  model: userModel,
                  attributes: {
                    exclude: ['password', 'token'],
                  },
                  through: {
                    attributes: [],
                  },
                },
              ],
              where: { ...subWhere },
            },
          ],
          // https://www.sequelize.cn/other-topics/sub-queries#%E4%BD%BF%E7%94%A8%E5%AD%90%E6%9F%A5%E8%AF%A2%E8%BF%9B%E8%A1%8C%E5%A4%8D%E6%9D%82%E6%8E%92%E5%BA%8F

          attributes: {
            include: [
              [
                literal(
                  `(select weight from ${liveRoomModel.tableName}
                    where ${liveRoomModel.tableName}.id = ${areaLiveRoomModel.tableName}.live_room_id)`
                ),
                'live_room_weight',
              ],
            ],
          },
          order: [['live_room_weight', 'desc']],
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

  /** 查找分区 */
  async find(id: number) {
    const result = await areaModel.findOne({
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
        },
      ],
      where: { id },
    });
    return result;
  }

  /** 创建分区 */
  async create(data: IArea) {
    const result = await areaModel.create(data);
    return result;
  }

  /** 修改分区 */
  async update(data: IArea) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await areaModel.update(data2, { where: { id }, limit: 1 });
    return result;
  }

  /** 删除分区 */
  async delete(id: number) {
    const result = await areaModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new AreaService();
