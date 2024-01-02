import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IHourData } from '@/interface';

interface HourDataModel
  extends Model<
      InferAttributes<HourDataModel>,
      InferCreationAttributes<HourDataModel>
    >,
    IHourData {}

const model = sequelize.define<HourDataModel>(
  'mock_hour_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    hour: {
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
