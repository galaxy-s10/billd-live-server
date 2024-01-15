import fs from 'fs';

import dayjs from 'dayjs';
import { Sequelize } from 'sequelize';
import { Model, ModelStatic } from 'sequelize/types';

import sequelize from '@/config/mysql';
import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

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
  console.log(model, field, total, unitNum, unit, '===');
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
    const sql = `INSERT INTO ${model.name} ( ${field}, created_at, updated_at ) VALUES`;
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

/** 删除所有外键 */
export const deleteAllForeignKeys = async (sequelizeInst: Sequelize) => {
  try {
    const queryInterface = sequelizeInst.getQueryInterface();
    const allTables: string[] = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables.toString()}`));
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
        chalkINFO(`当前${tableName}表的外键: ${constraint.toString()}`)
      );
    });
    await Promise.all(allConstraint1);
    console.log(chalkSUCCESS('删除所有外键成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有外键失败！'), err);
  }
};

/** 删除所有索引（除了PRIMARY） */
export const deleteAllIndexs = async (sequelizeInst: Sequelize) => {
  try {
    const queryInterface = sequelizeInst.getQueryInterface();
    const allTables = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables.toString()}`));
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
        chalkINFO(`当前${tableName}表的索引: ${indexStrArr.toString()}`)
      );
    });
    await Promise.all(allIndexs1);
    console.log(chalkSUCCESS('删除所有索引成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有索引失败！'), err);
  }
};

/**
 * 初始化表
 * @param model
 * @param method
 */
export const initTable = async (data: {
  model: ModelStatic<Model>;
  method?: 'force' | 'alter';
  sequelize: Sequelize;
}) => {
  async function main(
    modelArg: ModelStatic<Model>,
    methodArg?: 'force' | 'alter'
  ) {
    if (methodArg === 'force') {
      await deleteAllIndexs(data.sequelize);
      await deleteAllForeignKeys(data.sequelize);
      await modelArg.sync({ force: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚(重新)创建！`));
    } else if (methodArg === 'alter') {
      await deleteAllIndexs(data.sequelize);
      await deleteAllForeignKeys(data.sequelize);
      await modelArg.sync({ alter: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚同步成功！`));
    } else {
      console.log(chalkINFO(`加载数据库表: ${modelArg.tableName}`));
    }
  }
  try {
    await main(data.model, data.method);
  } catch (error: any) {
    console.log(chalkERROR(`initTable失败`), error.message);
    console.log(error);
  }
};

/** 加载所有model */
export const loadAllModel = () => {
  const modelDir = `${process.cwd()}/${
    PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'dist' : 'src'
  }/model`;
  fs.readdirSync(modelDir).forEach((file: string) => {
    if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
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
    loadAllModel();
    await sequelizeInst.drop();
    console.log(chalkSUCCESS('删除所有表成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有表失败！'));
  }
};

/**
 * 初始化数据库：
 * force:重置所有
 * alert:校正现有数据库
 * load:加载数据库表
 */
export const initDb = async (
  type: 'force' | 'alert' | 'load',
  sequelize: Sequelize
) => {
  switch (type) {
    case 'force':
      await deleteAllForeignKeys(sequelize);
      await deleteAllIndexs(sequelize);
      await deleteAllTable(sequelize);
      await sequelize.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
      console.log(chalkSUCCESS('初始化数据库所有表完成！'));
      break;
    case 'alert':
      require('@/model/relation');
      await sequelize.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
      console.log(chalkSUCCESS('校正数据库所有表完成！'));
      break;
    case 'load':
      require('@/model/relation');
      break;
    default:
      throw new Error('initDb参数不正确！');
  }
};
