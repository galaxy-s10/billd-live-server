import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IGoods } from '@/interface';

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
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    type: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    desc: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    short_desc: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    cover: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    original_price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nums: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pay_nums: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    inventory: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    badge: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    badge_bg: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    remark: {
      type: DataTypes.STRING(300),
      defaultValue: '',
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
