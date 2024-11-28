import AreaModel from '@/model/area.model';
import AreaLiveRoomModel from '@/model/areaLiveRoom.model';
import AuthModel from '@/model/auth.model';
import GlobalMsgModel from '@/model/globalMsg.model';
import LiveModel from '@/model/live.model';
import LiveRecordModel from '@/model/liveRecord.model';
import LiveRoomModel from '@/model/liveRoom.model';
import LiveViewModel from '@/model/liveView.model';
import LogModel from '@/model/log.model';
import LoginRecordModel from '@/model/loginRecord.model';
import OrderModel from '@/model/order.model';
import QqUserModel from '@/model/qqUser.model';
import RoleModel from '@/model/role.model';
import RoleAuthModel from '@/model/roleAuth.model';
import SigninRecordModel from '@/model/signinRecord.model';
import SigninStatisticsModel from '@/model/signinStatistics.model';
import ThirdUserModel from '@/model/thirdUser.model';
import UserModel from '@/model/user.model';
import UserLiveRoomModel from '@/model/userLiveRoom.model';
import UserRoleModel from '@/model/userRole.model';
import WalletModel from '@/model/wallet.model';
import WechatUserModel from '@/model/wechatUser.model';
import WsMessageModel from '@/model/wsMessage.model';

LiveViewModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LoginRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

GlobalMsgModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

WsMessageModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRoomModel.belongsToMany(AreaModel, {
  foreignKey: 'live_room_id',
  otherKey: 'area_id',
  constraints: false,
  through: {
    model: AreaLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

AreaModel.belongsToMany(LiveRoomModel, {
  foreignKey: 'area_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: AreaLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

AreaModel.hasMany(AreaLiveRoomModel, {
  foreignKey: 'area_id',
  constraints: false,
});

AreaLiveRoomModel.belongsTo(AreaModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

AreaLiveRoomModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

// AreaLiveRoomModel.hasMany(LiveRoomModel, {
//   foreignKey: 'id',
//   constraints: false,
//   // as: 'ddd',
// });

LiveRoomModel.belongsToMany(UserModel, {
  foreignKey: 'live_room_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(LiveRoomModel, {
  foreignKey: 'user_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: UserLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

SigninStatisticsModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

SigninRecordModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

SigninRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

SigninStatisticsModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

UserLiveRoomModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

UserModel.hasOne(WalletModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

UserModel.hasOne(LiveModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRecordModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoomModel.hasOne(LiveModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoomModel.hasOne(LiveRecordModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

WalletModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRoomModel.hasOne(UserLiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

UserLiveRoomModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

RoleModel.belongsToMany(AuthModel, {
  foreignKey: 'role_id',
  otherKey: 'auth_id',
  constraints: false,
  through: {
    model: RoleAuthModel,
    unique: false, // 不生成唯一索引
  },
});

AuthModel.belongsToMany(RoleModel, {
  foreignKey: 'auth_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: RoleAuthModel,
    unique: false, // 不生成唯一索引
  },
});

RoleModel.belongsTo(RoleModel, {
  as: 'p_role',
  foreignKey: 'p_id',
  constraints: false,
});

RoleModel.hasMany(RoleModel, {
  as: 'c_role',
  foreignKey: 'p_id',
  constraints: false,
});

AuthModel.belongsTo(AuthModel, {
  as: 'p_auth',
  foreignKey: 'p_id',
  constraints: false,
});

AuthModel.hasMany(AuthModel, {
  as: 'c_auth',
  foreignKey: 'p_id',
  constraints: false,
});

UserModel.hasMany(OrderModel, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});
OrderModel.belongsTo(UserModel, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});

UserModel.hasMany(LogModel, {
  foreignKey: 'user_id',
  constraints: false,
});
LogModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

ThirdUserModel.belongsTo(UserModel, {
  foreignKey: 'third_user_id',
  constraints: false,
});

QqUserModel.belongsToMany(UserModel, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(QqUserModel, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

WechatUserModel.belongsToMany(UserModel, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(WechatUserModel, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

RoleModel.belongsToMany(UserModel, {
  foreignKey: 'role_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserRoleModel,
    unique: false, // 不生成唯一索引
  },
});
UserModel.belongsToMany(RoleModel, {
  foreignKey: 'user_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: UserRoleModel,
    unique: false, // 不生成唯一索引
  },
});
