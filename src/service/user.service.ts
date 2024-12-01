import { deleteUseLessObjectKey } from 'billd-utils';
import { Op, literal, where } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE, THIRD_PLATFORM } from '@/constant';
import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import liveRoomModel from '@/model/liveRoom.model';
import qqUserModel from '@/model/qqUser.model';
import roleModel from '@/model/role.model';
import userModel from '@/model/user.model';
import walletModel from '@/model/wallet.model';
import wechatUserModel from '@/model/wechatUser.model';
import { IUser } from '@/types/IUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class UserService {
  /** 用户是否存在 */
  async isExist(ids: number[]) {
    const res = await userModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async login({ id, password }: IUser) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        id,
        password,
      },
    });
    return result;
  }

  async usernameLogin({ username, password }: IUser) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        username,
        password,
      },
    });
    return result;
  }

  /** 获取用户列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IUser>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['username', 'desc'],
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
    const result = await userModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      distinct: true,
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据id查找用户（不返回password，但返回token） */
  async findAndToken(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: roleModel,
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: ['password'],
      },
      where: { id },
    });
    return result;
  }

  /** 根据id查找用户（password和token都不返回） */
  async find(id: number) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 根据id查找用户密码 */
  async findPwd(id: number) {
    const result = await userModel.findOne({
      where: { id },
      attributes: ['password'],
    });
    return result;
  }

  /** 根据id修改用户密码 */
  async updatePwd({ id, password, token }: IUser) {
    const result = await userModel.update(
      { password, token },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 根据id查找用户（包括其他账号信息） */
  async findAccount(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: roleModel,
          through: { attributes: [] },
        },
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq,
            },
          },
        },
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
          through: {
            attributes: [],
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
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 获取用户信息 */
  async getUserInfo(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq,
            },
          },
        },
        {
          model: wechatUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.wechat,
            },
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
          through: {
            attributes: [],
          },
        },
        {
          model: roleModel,
          through: { attributes: [] },
        },
        {
          model: walletModel,
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
        include: [
          // [
          //   literal(
          //     `(select count(*) from comment where from_user_id = ${id})`
          //   ),
          //   'comment_total',
          // ],
          // [
          //   literal(`(select count(*) from star where to_user_id = ${id})`),
          //   'receive_star_total',
          // ],
        ],
      },
      where: { id },
    });
    return result;
  }

  /** 是否同名，区分大小写。同名则返回同名用户的信息,否则返回null */
  async isSameName(username: string) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      // @ts-ignore
      where: {
        username: where(literal(`BINARY username`), username),
      },
    });
    return result;
  }

  /** 根据id修改用户 */
  async update({ id, username, desc, status, avatar, token }: IUser) {
    const result = await userModel.update(
      { username, desc, status, avatar, token },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 创建用户 */
  async create(data: IUser) {
    const result = await userModel.create(data);
    return result;
  }

  /** 删除用户 */
  async delete(id: number) {
    const result = await userModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new UserService();
