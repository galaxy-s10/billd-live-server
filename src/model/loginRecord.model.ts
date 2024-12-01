import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILoginRecord } from '@/interface';

interface LoginRecordModel
  extends Model<
      InferAttributes<LoginRecordModel>,
      InferCreationAttributes<LoginRecordModel>
    >,
    ILoginRecord {}

const model = sequelize.define<LoginRecordModel>(
  'login_record',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    client_ip: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    type: {
      type: DataTypes.INTEGER,
    },
    user_agent: {
      type: DataTypes.STRING(500),
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
