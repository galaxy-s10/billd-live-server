import schedule from 'node-schedule';

import { SCHEDULE_TYPE } from '@/constant';
import { chalkINFO } from '@/utils/chalkTip';

import { handleVerifyStream } from './verifyStream';

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

// 每2分钟执行
rule.minute = allMinuteArr.filter((v) => v % 2 === 0);
rule.second = 0;

// 每5秒执行
// rule.minute = allMinuteArr.filter((v) => v % 1 === 0);
// rule.second = allSecondArr.filter((v) => v % 5 === 0);

export const startSchedule = () => {
  schedule.scheduleJob(SCHEDULE_TYPE.roomIsLiveing, rule, () => {
    console.log(
      chalkINFO(
        `${new Date().toLocaleString()}，执行${
          SCHEDULE_TYPE.roomIsLiveing
        }定时任务`
      )
    );
    handleVerifyStream();
  });
};
