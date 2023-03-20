import { monitBackupsDbJob } from './monitBackupsDb';
import { monitDeleteLogJob } from './monitDeleteLog';
import { monitMemoryJob } from './monitMemory';
import { monitProcessJob } from './monitProcess';
import { monitQiniuCDNJob } from './monitQiniuCDN';

export const initMonit = () => {
  monitMemoryJob(); // 监控服务器内存
  monitProcessJob(); // 监控node进程
  monitQiniuCDNJob(); // 监控七牛云cdn
  monitBackupsDbJob(); // 监控备份数据库
  monitDeleteLogJob(); // 监控删除日志
};
