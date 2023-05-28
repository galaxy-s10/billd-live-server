import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IGoods } from '@/interface';
import { initTable } from '@/utils';

interface GoodsModel
  extends Model<
      InferAttributes<GoodsModel>,
      InferCreationAttributes<GoodsModel>
    >,
    IGoods {}

const model = sequelize.define<GoodsModel>(
  'goods',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    desc: {
      type: DataTypes.STRING,
    },
    short_desc: {
      type: DataTypes.STRING,
    },
    cover: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.STRING,
    },
    original_price: {
      type: DataTypes.STRING,
    },
    nums: {
      type: DataTypes.INTEGER,
    },
    badge: {
      type: DataTypes.STRING,
    },
    badge_bg: {
      type: DataTypes.STRING,
    },
    remark: {
      type: DataTypes.STRING,
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
