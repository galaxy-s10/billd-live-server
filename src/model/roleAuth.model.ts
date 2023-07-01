import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IRoleAuth } from '@/interface';

interface RoleAuthModel
  extends Model<
      InferAttributes<RoleAuthModel>,
      InferCreationAttributes<RoleAuthModel>
    >,
    IRoleAuth {}

const model = sequelize.define<RoleAuthModel>(
  'role_auth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    auth_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      {
        name: 'role_id',
        fields: ['role_id'],
      },
      {
        name: 'auth_id',
        fields: ['auth_id'],
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
