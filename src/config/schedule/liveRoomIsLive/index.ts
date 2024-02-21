import nodeSchedule from 'node-schedule';

import liveRedisController from '@/config/websocket/live-redis.controller';
import { PROJECT_ENV, SCHEDULE_TYPE } from '@/constant';
import liveController from '@/controller/live.controller';
import { initUser } from '@/init/initUser';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { chalkINFO } from '@/utils/chalkTip';

const initLiveRoomId: number[] = [];
Object.keys(initUser).forEach((iten) => {
  initLiveRoomId.push(initUser[iten].live_room.id!);
});

export const main = async () => {
  const res = await liveController.common.getList({});
  res.rows.forEach((item) => {
    liveRedisController
      .getLiveRoomIsLiving({ liveRoomId: item.live_room_id! })
      .then((flag) => {
        if (!flag) {
          if (item.live_room?.type !== LiveRoomTypeEnum.system) {
            // redis没有数据，但数据库有数据，则需要删除数据库的数据
            liveController.common.deleteByLiveRoomId(item.live_room_id!);
          }
        }
      });
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

// 每1小时执行
// rule.hour = allHourArr.filter((v) => v % 1 === 0);
// rule.minute = 0;
// rule.second = 0;

// 每30分钟执行
// rule.minute = allMinuteArr.filter((v) => v % 30 === 0);
// rule.second = 0;

// 每5分钟执行
rule.minute = allMinuteArr.filter((v) => v % 5 === 0);
rule.second = 0;

// 每5秒执行
// rule.minute = allMinuteArr.filter((v) => v % 1 === 0);
// rule.second = allSecondArr.filter((v) => v % 5 === 0);

export const startLiveRoomIsLiveSchedule = () => {
  if (PROJECT_ENV === 'prod') {
    nodeSchedule.scheduleJob(SCHEDULE_TYPE.liveRoomIsLive, rule, () => {
      console.log(chalkINFO(`执行${SCHEDULE_TYPE.liveRoomIsLive}定时任务`));
      main();
    });
  }
};
