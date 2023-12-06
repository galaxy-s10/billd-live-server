import { loadAllModel } from '@/init/initDb';
import Area from '@/model/area.model';
import AreaLiveRoom from '@/model/areaLiveRoom.model';
import Auth from '@/model/auth.model';
import Live from '@/model/live.model';
import LivePlay from '@/model/livePlay.model';
import LiveRecord from '@/model/liveRecord.model';
import LiveRoom from '@/model/liveRoom.model';
import Log from '@/model/log.model';
import Order from '@/model/order.model';
import QqUser from '@/model/qqUser.model';
import Role from '@/model/role.model';
import RoleAuth from '@/model/roleAuth.model';
import ThirdUser from '@/model/thirdUser.model';
import User from '@/model/user.model';
import UserLiveRoom from '@/model/userLiveRoom.model';
import UserRole from '@/model/userRole.model';
import Wallet from '@/model/wallet.model';

loadAllModel();

LiveRoom.belongsToMany(Area, {
  foreignKey: 'live_room_id',
  otherKey: 'area_id',
  constraints: false,
  through: {
    model: AreaLiveRoom,
    unique: false, // 不生成唯一索引
  },
});

Area.belongsToMany(LiveRoom, {
  foreignKey: 'area_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: AreaLiveRoom,
    unique: false, // 不生成唯一索引
  },
});

Area.hasMany(AreaLiveRoom, {
  foreignKey: 'area_id',
  constraints: false,
});

AreaLiveRoom.belongsTo(LiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoom.belongsToMany(User, {
  foreignKey: 'live_room_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserLiveRoom,
    unique: false, // 不生成唯一索引
  },
});

User.belongsToMany(LiveRoom, {
  foreignKey: 'user_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: UserLiveRoom,
    unique: false, // 不生成唯一索引
  },
});

UserLiveRoom.belongsTo(LiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});

User.hasOne(Wallet, {
  foreignKey: 'user_id',
  constraints: false,
});

Live.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

LivePlay.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRecord.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

Live.belongsTo(LiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LivePlay.belongsTo(LiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});
LiveRecord.belongsTo(LiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoom.hasOne(Live, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoom.hasOne(LivePlay, {
  foreignKey: 'live_room_id',
  constraints: false,
});
LiveRoom.hasOne(LiveRecord, {
  foreignKey: 'live_room_id',
  constraints: false,
});

Wallet.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRoom.hasOne(UserLiveRoom, {
  foreignKey: 'live_room_id',
  constraints: false,
});

UserLiveRoom.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

Role.belongsToMany(Auth, {
  foreignKey: 'role_id',
  otherKey: 'auth_id',
  constraints: false,
  through: {
    model: RoleAuth,
    unique: false, // 不生成唯一索引
  },
});

Auth.belongsToMany(Role, {
  foreignKey: 'auth_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: RoleAuth,
    unique: false, // 不生成唯一索引
  },
});

Role.belongsTo(Role, {
  as: 'p_role',
  foreignKey: 'p_id',
  constraints: false,
});

Role.hasMany(Role, {
  as: 'c_role',
  foreignKey: 'p_id',
  constraints: false,
});

Auth.belongsTo(Auth, {
  as: 'p_auth',
  foreignKey: 'p_id',
  constraints: false,
});

Auth.hasMany(Auth, {
  as: 'c_auth',
  foreignKey: 'p_id',
  constraints: false,
});

User.hasMany(Order, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});
Order.belongsTo(User, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});

User.hasMany(Log, {
  foreignKey: 'user_id',
  constraints: false,
});
Log.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

ThirdUser.belongsTo(User, {
  foreignKey: 'third_user_id',
  constraints: false,
});

QqUser.belongsToMany(User, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});

User.belongsToMany(QqUser, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});

Role.belongsToMany(User, {
  foreignKey: 'role_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});
User.belongsToMany(Role, {
  foreignKey: 'user_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});
