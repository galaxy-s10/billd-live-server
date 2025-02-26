import fs from 'fs';

import { getArrayDifference } from 'billd-utils';
import dayjs from 'dayjs';
import { Sequelize } from 'sequelize';
import { Model, ModelStatic } from 'sequelize/types';

import sequelize from '@/config/mysql';
import { COMMON_HTTP_CODE, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { CustomError } from '@/model/customError.model';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

export async function mockTimeBatchInsert({
  model,
  field,
  total,
  unitNum,
  unit,
  format,
}: {
  model;
  field;
  total;
  unitNum: number;
  unit: dayjs.ManipulateType;
  format;
}) {
  const res = await model.findOne({
    order: [[field, 'desc']],
  });
  const lastDate = dayjs(
    res?.[field] || dayjs().subtract(6, 'month').format('YYYY-MM-DD 00:00:00')
  );
  const nowDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
  // const total = 36;
  // const groupChunk = 10;
  const groupChunk = 1000;
  const remainder = total % groupChunk;
  const group: any[] = [];
  for (let i = 1; i < total; i += groupChunk) {
    group.push(i);
  }
  if (remainder) {
    group.push(total);
  }
  let initIndex = 0;
  const queue: any[] = [];
  for (let x = 0; x < group.length; x += 1) {
    // eslint-disable-next-line
    const sql = `INSERT INTO ${model.tableName} ( ${field}, created_at, updated_at ) VALUES`;
    let str = '';
    if (group[x]) {
      for (initIndex; initIndex < group[x]; initIndex += 1) {
        const initStartDate = lastDate
          .add((initIndex + 1) * unitNum, unit)
          .format(format);
        str += `('${initStartDate}','${nowDate}','${nowDate}'),`;
      }
      const fullSql = sql + str.slice(0, str.length - 1);
      queue.push(sequelize.query(fullSql));
    }
  }
  await Promise.all(queue);
}

/** 删除外键 */
export const deleteForeignKeys = async (data: {
  sequelizeInst: Sequelize;
  model?: ModelStatic<Model>;
}) => {
  try {
    const { sequelizeInst, model } = data;
    const queryInterface = sequelizeInst.getQueryInterface();
    let allTables: string[] = [];
    if (model === undefined) {
      allTables = await queryInterface.showAllTables();
    } else if (model && allTables.find((v) => v === model.tableName)) {
      allTables = [model.tableName];
    }
    console.log(chalkWARN(`需要删除外键的表:${allTables.toString()}`));
    if (allTables.length) {
      const allIndexs: any = [];
      allTables.forEach((v) => {
        allIndexs.push(queryInterface.showIndex(v));
      });
      const allConstraint: any = [];
      allTables.forEach((v) => {
        allConstraint.push(queryInterface.getForeignKeysForTables([v]));
      });
      const res1 = await Promise.all(allConstraint);
      const allConstraint1: any = [];
      res1.forEach((v) => {
        const tableName = Object.keys(v)[0];
        const constraint: string[] = v[tableName];
        constraint.forEach((item) => {
          allConstraint1.push(queryInterface.removeConstraint(tableName, item));
        });
        console.log(
          chalkINFO(`${tableName}表的外键: ${constraint.toString()}`)
        );
      });
      await Promise.all(allConstraint1);
    }
    console.log(chalkSUCCESS(`删除${allTables.toString()}表的外键成功！`));
  } catch (err) {
    console.error(chalkERROR(`删除外键失败！`), err);
  }
};

/** 删除索引（除了PRIMARY） */
export const deleteIndexs = async (data: {
  sequelizeInst: Sequelize;
  model?: ModelStatic<Model>;
}) => {
  try {
    const { sequelizeInst, model } = data;
    const queryInterface = sequelizeInst.getQueryInterface();
    let allTables: string[] = [];
    if (model === undefined) {
      allTables = await queryInterface.showAllTables();
    } else if (model && allTables.find((v) => v === model.tableName)) {
      allTables = [model.tableName];
    }
    console.log(chalkWARN(`需要删除索引的表:${allTables.toString()}`));
    if (allTables.length) {
      const allIndexs: any = [];
      allTables.forEach((v) => {
        allIndexs.push(queryInterface.showIndex(v));
      });
      const res1 = await Promise.all(allIndexs);
      const allIndexs1: any = [];
      res1.forEach((v: any[]) => {
        const { tableName }: { tableName: string } = v[0];
        const indexStrArr: string[] = [];
        v.forEach((x) => {
          indexStrArr.push(x.name);
          if (x.name !== 'PRIMARY') {
            allIndexs1.push(queryInterface.removeIndex(tableName, x.name));
          }
        });
        console.log(
          chalkINFO(`${tableName}表的索引: ${indexStrArr.toString()}`)
        );
      });
      await Promise.all(allIndexs1);
    }
    console.log(chalkSUCCESS(`删除${allTables.toString()}表的索引成功！`));
  } catch (err) {
    console.error(chalkERROR(`删除索引失败！`), err);
  }
};

// 获取表字段信息
export async function getRealTableFields(tableName) {
  const queryInterface = sequelize.getQueryInterface();
  const tableInfo = await queryInterface.describeTable(tableName);
  return tableInfo;
}

// 删除表字段
export async function delRealTableFields({
  table,
  column,
}: {
  table: string;
  column: string;
}) {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.removeColumn(table, column);
  console.log(chalkSUCCESS(`删除${table}表的${column}字段成功！`));
}

/**
 * 初始化表
 * @param model
 * @param method
 */
export function initTable(data: {
  model: ModelStatic<Model>;
  method?: 'force' | 'alter' | 'alter-1';
  sequelize: Sequelize;
}) {
  async function main(
    modelArg: ModelStatic<Model>,
    methodArg?: 'force' | 'alter' | 'alter-1'
  ) {
    if (methodArg === 'force') {
      console.log(chalkWARN(`开始(重新)创建${modelArg.tableName}表`));
      await deleteIndexs({ sequelizeInst: data.sequelize, model: data.model });
      await deleteForeignKeys({
        sequelizeInst: data.sequelize,
        model: data.model,
      });
      await modelArg.sync({ force: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚(重新)创建！`));
    } else if (methodArg === 'alter') {
      console.log(chalkWARN(`开始同步${modelArg.tableName}表`));
      await deleteIndexs({ sequelizeInst: data.sequelize, model: data.model });
      await deleteForeignKeys({
        sequelizeInst: data.sequelize,
        model: data.model,
      });
      await modelArg.sync({ alter: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚同步成功！`));
    } else if (methodArg === 'alter-1') {
      console.log(chalkWARN(`开始同步${modelArg.tableName}表`));
      await deleteIndexs({ sequelizeInst: data.sequelize, model: data.model });
      await deleteForeignKeys({
        sequelizeInst: data.sequelize,
        model: data.model,
      });
      const tableFields = await getRealTableFields(data.model.name);
      const realTableFields = Object.keys(tableFields);
      const sequelizeTableFields = Object.keys(data.model.getAttributes());
      const shouldDelRealTableFields = getArrayDifference(
        realTableFields,
        sequelizeTableFields
      );
      const queue: Promise<any>[] = [];
      shouldDelRealTableFields.forEach((item) => {
        queue.push(
          delRealTableFields({ table: data.model.name, column: item })
        );
      });
      await Promise.all(queue);
      await modelArg.sync({ alter: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚同步成功！`));
    } else {
      console.log(chalkINFO(`加载数据库表: ${modelArg.tableName}`));
    }
  }
  return main(data.model, data.method).catch((err) => {
    console.error(chalkERROR(`initTable失败`), err.message);
    console.log(err);
  });
}

/** 加载所有model */
export const loadAllModel = () => {
  const modelDir = `${process.cwd()}/${
    PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'dist' : 'src'
  }/model`;
  fs.readdirSync(modelDir).forEach((file: string) => {
    if (PROJECT_ENV === PROJECT_ENV_ENUM.dev) {
      if (file.indexOf('.model.ts') === -1) return;
    } else if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
      if (file.indexOf('.model.ts') === -1) return;
    } else if (file.indexOf('.model.js') === -1) return;
    // eslint-disable-next-line
    require(`${modelDir}/${file}`).default;
  });
  console.log(chalkSUCCESS(`加载所有数据库表成功!`));
};

/** 删除所有表 */
export const deleteAllTable = async (sequelizeInst: Sequelize) => {
  try {
    await sequelizeInst.drop();
    console.log(chalkSUCCESS('删除所有表成功！'));
  } catch (error) {
    console.error(chalkERROR('删除所有表失败！'));
    console.log(error);
  }
};

/**
 * 初始化数据库：
 * force:重置所有
 * alter:校正现有数据库
 * load:加载数据库表
 */
export const initDb = async (
  type: 'force' | 'alter' | 'alter-1',
  sequelizeInst: Sequelize
) => {
  switch (type) {
    case 'force':
      console.log(chalkWARN('开始初始化数据库所有表'));
      await deleteForeignKeys({ sequelizeInst });
      await deleteIndexs({ sequelizeInst });
      await deleteAllTable(sequelizeInst);
      await sequelizeInst.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
      console.log(chalkSUCCESS('初始化数据库所有表完成！'));
      break;
    case 'alter':
      console.log(chalkWARN('开始校正数据库所有表'));
      await sequelizeInst.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
      console.log(chalkSUCCESS('校正数据库所有表完成！'));
      break;
    case 'alter-1': {
      const allModels = sequelize.models;
      const queue: Promise<any>[] = [];
      Object.keys(allModels).forEach((item) => {
        // console.log(allModels[item], '----');
        queue.push(
          initTable({ model: allModels[item], method: 'alter-1', sequelize })
        );
      });
      await Promise.all(queue);
      console.log(chalkSUCCESS('校正数据库所有表完成！'));
      break;
    }
    default: {
      throw new CustomError({
        msg: `initDb参数不正确！`,
        httpStatusCode: COMMON_HTTP_CODE.serverError,
        errorCode: COMMON_HTTP_CODE.serverError,
      });
    }
  }
};
