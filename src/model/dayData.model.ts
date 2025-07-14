import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IDayData } from '@/interface';
import { initTable } from '@/utils';

interface DayDataModel
  extends Model<
      InferAttributes<DayDataModel>,
      InferCreationAttributes<DayDataModel>
    >,
    IDayData {}

const model = sequelize.define<DayDataModel>(
  'day_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    today: {
      type: DataTypes.DATE,
    },
  },
  {
    // indexes: [
    //   {
    //     name: 'today',
    //     fields: ['today'],
    //   },
    // ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(model);
export default model;
