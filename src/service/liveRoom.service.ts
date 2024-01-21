import { deleteUseLessObjectKey, isPureNumber } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import { handlePaging } from '@/utils';

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
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
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
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
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
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await liveRoomModel.findAndCountAll({
      include: [
        // {
        //   model: userLiveRoomModel,
        //   include: [
        //     {
        //       model: userModel,
        //       attributes: {
        //         exclude: ['password', 'token'],
        //       },
        //     },
        //   ],
        //   required: true,
        //   // attributes: [],
        // },
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
        exclude: ['key'],
        // include: [
        //   [col('user_live_room.id'), 'idd'],
        //   [col('user_live_room.user.id'), 'user_id'],
        //   [col('user_live_room.user.username'), 'user_username'],
        //   [col('user_live_room.user.avatar'), 'user_avatar'],
        // ],
      },
      distinct: true,
      order: [[orderName, orderBy]],
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
        exclude: ['key'],
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: ['key'],
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
  async update({
    id,
    status,
    is_show,
    remark,
    cover_img,
    bg_img,
    name,
    desc,
    key,
    type,
    pull_is_should_auth,
    weight,
    cdn,
    rtmp_url,
    flv_url,
    hls_url,
  }: ILiveRoom) {
    const result = await liveRoomModel.update(
      {
        status,
        is_show,
        remark,
        cover_img,
        bg_img,
        name,
        desc,
        key,
        type,
        pull_is_should_auth,
        weight,
        cdn,
        rtmp_url,
        flv_url,
        hls_url,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建直播间 */
  async create({
    status,
    is_show,
    remark,
    cover_img,
    bg_img,
    name,
    desc,
    key,
    type,
    pull_is_should_auth,
    weight,
    cdn,
    rtmp_url,
    flv_url,
    hls_url,
  }: ILiveRoom) {
    const result = await liveRoomModel.create({
      status,
      is_show,
      remark,
      cover_img,
      bg_img,
      name,
      desc,
      key,
      type,
      pull_is_should_auth,
      weight,
      cdn,
      rtmp_url,
      flv_url,
      hls_url,
    });
    return result;
  }

  /** 删除直播间 */
  async delete(id: number) {
    const result = await liveRoomModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomService();
