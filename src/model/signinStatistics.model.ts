import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ISigninStatistics } from '@/interface';

interface SigninStatisticsModel
  extends Model<
      InferAttributes<SigninStatisticsModel>,
      InferCreationAttributes<SigninStatisticsModel>
    >,
    ISigninStatistics {}

const model = sequelize.define<SigninStatisticsModel>(
  'signin_statistics',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    nums: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_nums: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sum_nums: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    recently_signin_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
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
