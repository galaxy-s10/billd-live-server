import { ParameterizedContext } from 'koa';
import { Model, ModelStatic } from 'sequelize/types';

import sequelize from '@/config/mysql';
import { chalkERROR, chalkSUCCESS, chalkINFO } from '@/utils/chalkTip';

/**
 * 获取日期当天的开始时间到结束时间
 */
export function dateStartAndEnd(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const startTime = `${y}-${m}-${d} 00:00:00`;
  const endTime = `${y}-${m}-${d} 23:59:59`;
  return {
    startTime,
    endTime,
  };
}

/**
 * @description: 处理free命令返回的内存信息
 * @param {string} str
 * @return {*}
 */
export const handleData = (str: string) => {
  const arr = str.match(/\S+/g)!;

  const mem = 'Mem:';
  const swap = 'Swap:';
  const res: any = [];
  const obj: any = {};

  res.push(arr.splice(0, 6));
  res.push(arr.splice(0, 7));
  res.push(arr.splice(0, arr.length));

  res[0].forEach((key: string, index: number) => {
    res[1][index + 1] && (obj[mem + key] = res[1][index + 1]);
    res[2][index + 1] && (obj[swap + key] = res[2][index + 1]);
  });
  return obj;
};

export const replaceKeyFromValue = (str: string, obj: object) => {
  let res = str;
  Object.keys(obj).forEach((v) => {
    res = res.replace(new RegExp(`{${v}}`, 'ig'), obj[v]);
  });
  return res;
};

export const getFileExt = (name: string) => {
  const arr = name.split('.');
  const ext = arr[arr.length - 1];
  return ext;
};

/**
 * @description:
 * @param {any} fnArray
 * @param {*} time
 * @return {*}
 */
export const promiseQueue = async (fnArray: any[], time?: number) => {
  const asyncPromise = (fn: any, index: number) => {
    return new Promise((resolve) => {
      if (Object.prototype.toString.call(fn) === '[object Function]') {
        // 首次不走定时器
        if (index === 0) {
          fn?.();
          resolve(true);
        } else if (time) {
          setTimeout(() => {
            fn?.();
            resolve(true);
          }, time);
        } else {
          fn?.();
          resolve(true);
        }
      }
    });
  };
  for (let i = 0; i < fnArray.length; i += 1) {
    const fn = fnArray[i];
    // eslint-disable-next-line
    await asyncPromise(fn, i);
  }
};

/** 模拟ajax请求 */
export const mockAjax = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: {
          name: '张三',
          age: 18,
        },
      });
    }, time);
  });
};

export const isAdmin = (ctx: ParameterizedContext) =>
  ctx.req.url!.indexOf('/admin/') !== -1;

/** 转换时间格式,datetime可以是字符串'2022-8-28 00:00:00'，也可以是数字时间戳1673171023498 */
export const formatDate = (datetime) => {
  function addDateZero(num: number) {
    return num < 10 ? `0${num}` : num;
  }
  const d = new Date(datetime);
  const formatdatetime = `${d.getFullYear()}-${addDateZero(
    d.getMonth() + 1
  )}-${addDateZero(d.getDate())} ${addDateZero(d.getHours())}:${addDateZero(
    d.getMinutes()
  )}:${addDateZero(d.getSeconds())}`;
  return formatdatetime;
};

/** 处理返回的分页数据 */
export const handlePaging = (
  result: any,
  nowPage?: string,
  pageSize?: string
) => {
  // @ts-ignore
  const obj: {
    nowPage: number;
    pageSize: number;
    hasMore: boolean;
    total: number;
    rows: any[];
  } = {};
  obj.nowPage = nowPage ? +nowPage : 1;
  obj.pageSize = pageSize ? +pageSize : result.count;
  obj.hasMore = obj.nowPage * obj.pageSize - result.count < 0;
  obj.total = result.count;
  obj.rows = result.rows;
  return obj;
};

/** 删除所有外键 */
export const deleteAllForeignKeys = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
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
export const deleteAllIndexs = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
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
export const initTable = (
  model: ModelStatic<Model>,
  method?: 'force' | 'alter'
) => {
  async function main(
    modelArg: ModelStatic<Model>,
    methodArg: 'force' | 'alter'
  ) {
    if (methodArg === 'force') {
      await deleteAllForeignKeys();
      await modelArg.sync({ force: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚(重新)创建！`));
    } else if (methodArg === 'alter') {
      await deleteAllForeignKeys();
      await modelArg.sync({ alter: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚同步成功！`));
    } else {
      console.log(chalkINFO(`加载数据库表: ${modelArg.tableName}`));
    }
  }
  main(model, method!).catch((err) => {
    console.log(chalkERROR(`initTable失败`), err.message);
    console.log(err);
  });
};

/**
 * 去除url上的参数，获取url
 * @param url string
 * @returns string
 */
export const getUrl = (url: string) => {
  return url.replace(/\?.+/, '');
};

/**
 * 获取[min,max]之间的随机整数
 * 例如：[10,30],[-21,32],[-100,-20]
 */
export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * @description 获取[min,max]之间的随机整数。
 * @example getRangeRandom([-10,100]) ===> -8
 * @param {number} min
 * @param {number} max
 * @return {*}
 */
export const getRangeRandom = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * @description 获取随机字符串(ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789)
 * @example getRandomString(4) ===> abd3
 * @param {number} length
 * @return {*}
 */
export const getRandomString = (length: number): string => {
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < length; i += 1) {
    // res += str.charAt(getRangeRandom(0, str.length - 1));
    res += str[getRangeRandom(0, str.length - 1)];
  }
  return res;
};

/**
 * 获取随机数字字符串
 * length: 长度，不能大于16
 */
export const randomNumber = (length: number): number => {
  const str = Math.random().toString().slice(2);
  const res = +str.slice(str.length - length);
  return res;
};

/**
 * @param code 验证码
 * @param desc 验证码作用
 * @param exp 有效期，单位：秒，但返回时会转换成分钟
 */
export const emailContentTemplate = ({
  code,
  desc,
  exp,
  subject,
}: {
  code: string;
  desc: string;
  exp: number;
  subject?: string;
}) => {
  const subjectTemp = subject || `【自然博客】验证码：${code}`;
  const content = `【自然博客】验证码：${code}，此验证码用于${desc}，有效期${
    exp / 60
  }分钟，请勿告知他人。`;
  return { subject: subjectTemp, content };
};

/** 数组去重 */
export const arrayUnique = (arr: number[]) => {
  return Array.from(new Set(arr));
};

/** 求并集 */
export const arrayGetUnion = (a: any[], b: any[]) => {
  return a.concat(
    b.filter((v) => {
      return a.indexOf(v) === -1;
    })
  );
};

/** 求交集 */
export const arrayGetIntersection = (a: any[], b: any[]) => {
  return a.filter((v) => {
    return b.indexOf(v) > -1;
  });
};

/**
 * 求差集，a:[1,2,3]，b:[2,4,5]，结果：[1,3]
 * a:[2,4,5]，b:[1,2,3]，结果：[4,5]
 */
export const arrayGetDifference = (a: any[], b: any[]) => {
  return a.filter((v) => {
    return b.indexOf(v) === -1;
  });
};

/**
 * 扁平化数据转树型
 */
export const arrayToTree = ({
  originArr = [],
  originPid = 1,
  originIdKey = 'id',
  originPidKey = 'pid',
  resChildrenKey = 'children',
  resIdKey = undefined,
  resPidKey = undefined,
}) => {
  // eslint-disable-next-line no-shadow
  const handleToTree = (arr: any[], pid: number) => {
    // 循环，获取该id的children
    function loop(_pid: number) {
      // 保存得到的数据
      const res: any = [];
      // 遍历原数组
      for (let i = 0; i < arr.length; i += 1) {
        const item = arr[i];
        if (resIdKey && item[originIdKey] !== undefined) {
          item[resIdKey] = item[originIdKey];
          delete item[originIdKey];
        }
        if (resPidKey && item[originPidKey] !== undefined) {
          item[resPidKey] = item[originPidKey];

          delete item[originPidKey];
        }
        // @ts-ignore
        if (item[originPidKey] === _pid || item[resPidKey] === _pid) {
          // 如果遍历到当前item的p_id等于目标_pid，在将该item插入到res前，
          // 先遍历该item的id，找到原数组arr里面该item的所有children后，再将该item连同找到的children一起插入到res
          // item[resChildrenKey] = loop(item[resIdKey] || item[originIdKey]);
          // @ts-ignore
          const children = loop(item[resIdKey] || item[originIdKey]);
          if (children.length) item[resChildrenKey] = children;
          // 如果当前item的p_id等于目标_pid，则将这个item插入res
          res.push(item);
        }
      }
      return res;
    }

    return loop(pid);
  };
  const data = JSON.parse(JSON.stringify(originArr));
  return handleToTree(data, originPid);
};

/**
 * 获取最近一周
 */
export const getLastestWeek = () => {
  const oneDay = 1000 * 60 * 60 * 24;
  const endDate = +new Date();
  const startDate = endDate - oneDay * 7;
  return { startDate, endDate };
};

/**
 * @description 格式化内存大小（要求传入的数字以byte为单位）
 * @param {number} val
 * @param {*} num 显示几位小数，默认2
 * @return {*}
 */
export const formatMemorySize = (val: number, num = 2) => {
  // bit:"比特"或"位",1byte=8bit
  const oneByte = 1;
  const oneKb = oneByte * 1024;
  const oneMb = oneKb * 1024;
  const oneGb = oneMb * 1024;
  const oneTb = oneGb * 1024;
  const format = (v: number) => v.toFixed(num);
  if (val < oneKb) {
    return `${format(val / oneByte)}byte`;
  }
  if (val < oneMb) {
    return `${format(val / oneKb)}kb`;
  }
  if (val < oneGb) {
    return `${format(val / oneMb)}mb`;
  }
  if (val < oneTb) {
    return `${format(val / oneGb)}gb`;
  }
  return `${format(val / oneTb)}tb`;
};
