import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IMinuteData } from '@/interface';

interface MinuteThirtyDataModel
  extends Model<
      InferAttributes<MinuteThirtyDataModel>,
      InferCreationAttributes<MinuteThirtyDataModel>
    >,
    IMinuteData {}

const model = sequelize.define<MinuteThirtyDataModel>(
  'mock_minute_thirty_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    minute: {
      type: DataTypes.DATE,
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
