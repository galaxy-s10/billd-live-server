import { DataTypes } from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/utils';

const model = sequelize.define(
  'live',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    socketId: {
      type: DataTypes.STRING(100),
    },
    roomId: {
      type: DataTypes.STRING(100),
    },
    data: {
      type: DataTypes.TEXT,
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
