import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DanmuMsgTypeEnum,
  IWsMessage,
  WsMessageMsgIsFileEnum,
  WsMessageMsgIsShowEnum,
  WsMessageMsgIsVerifyEnum,
} from '@/interface';

interface WsMessageModel
  extends Model<
      InferAttributes<WsMessageModel>,
      InferCreationAttributes<WsMessageModel>
    >,
    IWsMessage {}

const model = sequelize.define<WsMessageModel>(
  'ws_message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    redbag_send_id: {
      type: DataTypes.INTEGER,
    },
    ip: {
      type: DataTypes.STRING(200),
    },
    content: {
      type: DataTypes.STRING(500),
    },
    origin_content: {
      type: DataTypes.STRING(500),
    },
    username: {
      type: DataTypes.STRING(50),
    },
    origin_username: {
      type: DataTypes.STRING(50),
    },
    msg_is_file: {
      type: DataTypes.INTEGER,
      defaultValue: WsMessageMsgIsFileEnum.no,
    },
    msg_type: {
      type: DataTypes.INTEGER,
      defaultValue: DanmuMsgTypeEnum.danmu,
    },
    user_agent: {
      type: DataTypes.STRING(500),
    },
    send_msg_time: {
      type: DataTypes.STRING,
    },
    is_show: {
      type: DataTypes.STRING,
      defaultValue: WsMessageMsgIsShowEnum.yes,
    },
    is_verify: {
      type: DataTypes.STRING,
      defaultValue: WsMessageMsgIsVerifyEnum.yes,
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
      {
        name: 'ip',
        fields: ['ip'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });
export default model;
