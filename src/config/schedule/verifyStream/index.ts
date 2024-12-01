import { exec } from 'child_process';

import nodeSchedule from 'node-schedule';

import {
  LOCALHOST_URL,
  MAX_BITRATE,
  PROJECT_ENV,
  SCHEDULE_TYPE,
} from '@/constant';
import srsController from '@/controller/srs.controller';
import { initUser } from '@/init/initUser';
import { IApiV1Streams } from '@/types/srs';
import { chalkINFO, chalkWARN } from '@/utils/chalkTip';

// WARN 执行ffmpeg命令返回信息，但不会返回code 0退出，都是非0 code退出
function executeCommandWithTimeout(command, timeout) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });

    const timeoutId = setTimeout(() => {
      childProcess.kill();
      reject(new Error('子进程超时，终止子进程'));
    }, timeout);

    childProcess.on('exit', () => {
      clearTimeout(timeoutId);
    });
  });
}

// eslint-disable-next-line
async function verifyBitrateIsOver(info: IApiV1Streams['streams'][0]) {
  try {
    await executeCommandWithTimeout(
      `ffmpeg -i rtmp://${LOCALHOST_URL}/livestream/${info.name}`,
      5000
    );
  } catch (error: any) {
    const errStr = error.message ? String(error.message) : '';
    const res = errStr.match(/bitrate: (.+) kb\/s/);
    if (res) {
      const bitrate = Number(res[1]);
      console.log(
        chalkWARN(
          `流名称：${info.name}，当前码率：${res[0]}，kbps（recv_30s）：${info.kbps.recv_30s}，kbps（send_30s）：${info.kbps.send_30s}，`
        )
      );
      if (bitrate > MAX_BITRATE) {
        // 码率超过阈值，踢掉
        srsController.common.deleteApiV1Clients(info.publish.cid);
      }
    }
  }
}

const initLiveRoomId: number[] = [];
Object.keys(initUser).forEach((iten) => {
  const live_room_id = initUser[iten]?.live_room?.id;
  if (live_room_id) {
    initLiveRoomId.push(live_room_id);
  }
});

export const handleVerifyStream = async () => {
  const res = await srsController.common.getApiV1Streams({
    start: 0,
    count: 9999,
  });

  res.streams.forEach((item) => {
    // verifyBitrateIsOver(item);
    console.log(
      // kbps, kbit/s, kb/s都是同一个意思
      chalkWARN(
        `流名称：${item.name}，kbps（recv_30s推流码率）：${item.kbps.recv_30s}，kbps（send_30s）：${item.kbps.send_30s}，`
      )
    );
    const liveRoomId = item.name.replace('roomId___', '');
    if (initLiveRoomId.includes(Number(liveRoomId))) {
      console.log(
        chalkWARN(`房间id：${liveRoomId}，它是初始化直播间，不判断码率`)
      );
      return;
    }
    if (item.kbps.recv_30s > MAX_BITRATE) {
      srsController.common.deleteApiV1Clients(item.publish.cid);
    }
  });
};

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
rule.minute = allMinuteArr.filter((v) => v % 2 === 0);
rule.second = 0;

// 每5秒执行
// rule.minute = allMinuteArr.filter((v) => v % 1 === 0);
// rule.second = allSecondArr.filter((v) => v % 5 === 0);

export const startVerifyStreamSchedule = () => {
  if (PROJECT_ENV === 'prod') {
    nodeSchedule.scheduleJob(SCHEDULE_TYPE.verifyStream, rule, () => {
      console.log(chalkINFO(`执行${SCHEDULE_TYPE.verifyStream}定时任务`));
      handleVerifyStream();
    });
  }
};
