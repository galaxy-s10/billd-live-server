import fs from 'fs';
import path from 'path';

import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import { SCHEDULE_TYPE, WEBM_DIR } from '@/constant';

const rule = new nodeSchedule.RecurrenceRule();

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
// rule.minute = allMinuteArr.filter((v) => v % 2 === 0);
// rule.second = 0;

// 每1秒执行
rule.minute = allMinuteArr.filter((v) => v % 1 === 0);
rule.second = allSecondArr.filter((v) => v % 1 === 0);

let blobId = 1;

export const startBlobIsExistSchedule = (data: {
  roomId: number;
  msrDelay: number;
  msrMaxDelay: number;
}) => {
  const delay = data.msrDelay / 1000;
  if (delay > 10 || !Number.isInteger(delay)) {
    return null;
  }
  // 每data.delay / 1000秒执行
  rule.second = allSecondArr.filter((v) => v % delay === 0);
  const jobName = `${SCHEDULE_TYPE.blobIsExist}___${data.roomId}`;
  blobId = 1;
  const scheduleJob = nodeSchedule.scheduleJob(jobName, rule, () => {
    const roomDir = path.resolve(WEBM_DIR, `roomId_${data.roomId}`);
    const fileDir = `${roomDir}/file`;
    const fileResDir = `${fileDir}/res`;
    const file = `${fileResDir}/${blobId}.mp4`;
    function findPreFile(id: number) {
      if (id < blobId - 10) {
        // 如果前10个文件都没有，就不继续找了
        return null;
      }
      const filepath = `${fileResDir}/${id}.mp4`;
      if (fs.existsSync(filepath)) {
        return filepath;
      }
      // eslint-disable-next-line no-param-reassign
      id -= 1;
      return findPreFile(id);
    }
    if (fs.existsSync(file)) {
      // console.log(chalkSUCCESS('定时任务找到mp4'), blobId);
      const timer = setTimeout(() => {
        if (fs.existsSync(file)) {
          rimrafSync(file);
        }
        clearTimeout(timer);
      }, data.msrMaxDelay * 2);
    } else {
      // console.log(chalkERROR('定时任务找不到mp4'), blobId);
      const preFile = findPreFile(blobId);
      if (preFile) {
        // console.log(chalkSUCCESS('找到上个mp4文件'), preFile);
        fs.copyFileSync(preFile, file);
        const timer = setTimeout(() => {
          if (fs.existsSync(file)) {
            rimrafSync(file);
          }
          clearTimeout(timer);
        }, data.msrMaxDelay * 2);
      } else {
        // console.log(chalkERROR('找不到上个mp4文件'), blobId);
      }
    }
    blobId += 1;
  });
  return scheduleJob;
};
