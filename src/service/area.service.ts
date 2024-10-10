import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IArea, IList } from '@/interface';
import areaModel from '@/model/area.model';
import areaLiveRoomModel from '@/model/areaLiveRoom.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
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
    priority,
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
      priority,
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
    const childWhere = deleteUseLessObjectKey({
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
      where: { ...childWhere },
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
    priority,
    childNowPage,
    childPageSize,
    childOrderName,
    childOrderBy,
    childKeyWord,
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
    let childOffset;
    let childLimit;
    if (childNowPage && childPageSize) {
      childOffset = (+childNowPage - 1) * +childPageSize;
      childLimit = +childPageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      name,
      remark,
      priority,
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
    const childWhere = deleteUseLessObjectKey({
      is_show: live_room_is_show,
      status: live_room_status,
    });
    if (childKeyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
        {
          remark: {
            [Op.like]: `%${childKeyWord}%`,
          },
        },
      ];
      childWhere[Op.or] = keyWordWhere;
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const childOrderRes: any[] = [];
    if (childOrderName && childOrderBy) {
      childOrderRes.push([liveRoomModel, childOrderName, childOrderBy]);
      // childOrderRes.push([
      //   literal(`${liveRoomModel.name}.${childOrderName}`),
      //   childOrderBy,
      // ]);
    }
    const result = await areaModel.findAndCountAll({
      limit,
      offset,
      order: [...orderRes],
    });
    const queue: any[] = [];
    result.rows.forEach((item) => {
      queue.push(
        areaLiveRoomModel.findAll({
          limit: childLimit,
          offset: childOffset,
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
                  model: userLiveRoomModel,
                  include: [
                    {
                      model: userModel,
                      attributes: {
                        exclude: ['password', 'token'],
                      },
                    },
                  ],
                  attributes: ['id'],
                },
                {
                  model: liveModel,
                  attributes: ['id'],
                },
              ],
              where: { ...childWhere },
            },
          ],
          attributes: [],
          order: [...childOrderRes],
          where: {
            area_id: item.id,
          },
        })
      );
    });
    const result2 = await Promise.all(queue);
    const result3 = result.rows.map((item, index) => {
      return {
        ...item.get(),
        live_rooms: result2[index].map((vv) => {
          const res = {
            ...vv.live_room.get(),
            user: vv.live_room.user_live_room.user,
          };
          delete res.user_live_room;
          return res;
        }),
      };
    });
    return handlePaging(
      { count: result.count, rows: result3 },
      nowPage,
      pageSize
    );
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
