import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { MONIT_JOB, PROJECT_ENV } from '@/constant';
import logController from '@/controller/log.controller';
import { chalkINFO, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

const rule = new schedule.RecurrenceRule();

const allHour = 24;
const allMinute = 60;
const allSecond = 60;
const allHourArr: number[] = [];
const allMinuteArr: number[] = [];
const allSecondArr: number[] = [];

for (let i = 0; i < allHour; i += 1) {
  allHourArr.push(i);
}
for (let i = 0; i < allMinute; i += 1) {
  allMinuteArr.push(i);
}
for (let i = 0; i < allSecond; i += 1) {
  allSecondArr.push(i);
}

// 每23小时执行
rule.hour = allHourArr.filter((v) => v % 23 === 0);
rule.minute = 0;

export const main = () => {
  logController.common.deleteRang();
};

export const monitDeleteLogJob = () => {
  console.log(chalkSUCCESS('监控任务: 删除日志定时任务启动！'));
  const monitJobName = MONIT_JOB.DELETELOG;
  schedule.scheduleJob(monitJobName, rule, () => {
    if (PROJECT_ENV === 'prod') {
      console.log(
        chalkINFO(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，执行${monitJobName}定时任务`
        )
      );
      main();
    } else {
      console.log(
        chalkWARN(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，当前非生产环境，不执行${monitJobName}定时任务`
        )
      );
    }
  });
};
