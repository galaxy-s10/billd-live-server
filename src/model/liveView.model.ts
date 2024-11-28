import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILiveView } from '@/interface';

interface LiveViewModel
  extends Model<
      InferAttributes<LiveViewModel>,
      InferCreationAttributes<LiveViewModel>
    >,
    ILiveView {}

const model = sequelize.define<LiveViewModel>(
  'live_view',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_record_id: {
      type: DataTypes.INTEGER,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    user_agent: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
    client_ip: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    client_env: {
      type: DataTypes.INTEGER,
    },
    remark: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });

export default model;
