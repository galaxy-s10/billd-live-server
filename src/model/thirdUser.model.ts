import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { THIRD_PLATFORM } from '@/constant';
import { IThirdUser } from '@/interface';
import { initTable } from '@/utils';

interface ThirdUserModel
  extends Model<
      InferAttributes<ThirdUserModel>,
      InferCreationAttributes<ThirdUserModel>
    >,
    IThirdUser {}

const model = sequelize.define<ThirdUserModel>(
  'third_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    third_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    third_platform: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: THIRD_PLATFORM.website,
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
      {
        name: 'third_user_id',
        fields: ['third_user_id'],
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
