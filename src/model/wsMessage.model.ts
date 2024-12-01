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
  SwitchEnum,
  WsMessageContentTypeEnum,
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
    live_record_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    client_ip: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    content_type: {
      type: DataTypes.INTEGER,
      defaultValue: WsMessageContentTypeEnum.txt,
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
    msg_type: {
      type: DataTypes.INTEGER,
      defaultValue: DanmuMsgTypeEnum.danmu,
    },
    user_agent: {
      type: DataTypes.STRING(500),
    },
    send_msg_time: {
      type: DataTypes.DATE,
    },
    is_show: {
      type: DataTypes.INTEGER,
      defaultValue: SwitchEnum.yes,
    },
    remark: {
      type: DataTypes.STRING(500),
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
      {
        name: 'client_ip',
        fields: ['client_ip'],
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
