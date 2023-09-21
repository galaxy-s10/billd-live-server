import { spawnSync } from 'child_process';
import os from 'os';
import path from 'path';

/**
 * 获取当前机器的ip地址
 */
export function getIpAddress() {
  const interfaces = os.networkInterfaces();
  const res: string[] = [];
  Object.keys(interfaces).forEach((dev) => {
    const iface = interfaces[dev];
    if (iface) {
      for (let i = 0; i < iface.length; i += 1) {
        const { family, address } = iface[i];
        if (family === 'IPv4') {
          res.push(address);
        }
      }
    }
  });
  return res;
}

/** 异步包装器 */
export const asyncWraper = async (fn) => {
  await fn();
};

/** 延迟执行 */
export const delayByPromise = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
    }, delay);
  });
};

export function dockerIsInstalled() {
  const res = spawnSync('docker', ['-v']);
  if (res.status !== 0) {
    return false;
  }
  return true;
}

export const filterObj = (obj: Record<string, any>, keyArr: string[]) => {
  const res: Record<string, any> = {};
  Object.keys(obj).forEach((item) => {
    if (!keyArr.includes(item)) {
      res[item] = obj[item];
    }
  });
  return res;
};

export const resolveApp = (relativePath) =>
  path.join(__dirname, '../../', relativePath);

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

/** 处理返回的分页数据 */
export const handlePaging = <T>(
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
    rows: T[];
  } = {};
  obj.nowPage = nowPage ? +nowPage : 1;
  obj.pageSize = pageSize ? +pageSize : result.count;
  obj.hasMore = obj.nowPage * obj.pageSize - result.count < 0;
  obj.total = result.count;
  obj.rows = result.rows;
  return obj;
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
