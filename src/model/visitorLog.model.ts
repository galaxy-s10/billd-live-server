import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IVisitorLog } from '@/interface';

interface VisitorLogModel
  extends Model<
      InferAttributes<VisitorLogModel>,
      InferCreationAttributes<VisitorLogModel>
    >,
    IVisitorLog {}

const model = sequelize.define<VisitorLogModel>(
  'visitor_log',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:非直播间进入 非-1:直播间进入
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    client_ip: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    user_agent: {
      type: DataTypes.STRING(500),
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
