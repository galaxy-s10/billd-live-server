import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IEmailUser } from '@/interface';
import { initTable } from '@/utils';

interface EmailUserModel
  extends Model<
      InferAttributes<EmailUserModel>,
      InferCreationAttributes<EmailUserModel>
    >,
    IEmailUser {}

const model = sequelize.define<EmailUserModel>(
  'email_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
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

initTable(model);
export default model;
