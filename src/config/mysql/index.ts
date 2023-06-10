import { Sequelize } from 'sequelize';

import { MYSQL_CONFIG } from '@/config/secret';
import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { initDb } from '@/init/initDb';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

export const dbName =
  PROJECT_ENV !== PROJECT_ENV_ENUM.prod
    ? `${MYSQL_CONFIG.database}_test`
    : MYSQL_CONFIG.database;

export function newSequelize(db?) {
  return new Sequelize({
    database: db,
    username: MYSQL_CONFIG.username,
    password: MYSQL_CONFIG.password,
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port,
    dialect: 'mysql',
    dialectOptions: {
      // 返回正确的时间戳字符串。
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00',
  });
}

const msg = (flag: boolean) =>
  `连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库${
    flag ? '成功' : '失败'
  }!`;

const sequelize = newSequelize(dbName);

async function handleInit() {
  const initSequelize = newSequelize();
  try {
    await initSequelize.query(`USE ${dbName}`, { logging: false });
  } catch (error: any) {
    if (error.message.indexOf('Access') !== -1) {
      console.log(error);
      console.log(chalkERROR(msg(false)));
      await initSequelize.close();
      return;
    }
    console.log(chalkWARN(`${dbName}数据库不存在，开始新建${dbName}数据库！`));
    await initSequelize.query(
      `CREATE DATABASE ${dbName} CHARACTER SET = 'utf8mb4';`,
      { logging: false }
    );
    console.log(chalkSUCCESS(`新建${dbName}数据库成功！`));
    await initDb('force', sequelize);
  }
  await initSequelize.close();
}

/** 连接数据库 */
export const connectMysql = async () => {
  console.log(
    chalkINFO(
      `开始连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库...`
    )
  );
  await handleInit();
  await sequelize.authenticate({ logging: false });
  await initDb('load', sequelize);
  console.log(chalkSUCCESS(msg(true)));
};

export default sequelize;
