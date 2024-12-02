import nodeSchedule from 'node-schedule';

import { PROJECT_ENV, SCHEDULE_TYPE } from '@/constant';
import liveController from '@/controller/live.controller';
import srsController from '@/controller/srs.controller';
import { initUser } from '@/init/initUser';
import { LivePlatformEnum } from '@/interface';
import { chalkINFO } from '@/utils/chalkTip';
import { tencentcloudCssUtils } from '@/utils/tencentcloud-css';

const initLiveRoomId: number[] = [];
Object.keys(initUser).forEach((iten) => {
  const live_room_id = initUser[iten]?.live_room?.id;
  if (live_room_id) {
    initLiveRoomId.push(live_room_id);
  }
});

export const tencentcloudCssMain = async () => {
  const res1 = await liveController.common.findAll({
    platform: LivePlatformEnum.tencentcloud_css,
  });
  const res2 = await tencentcloudCssUtils.queryLiveStreamAll();
  const res1Map = {};
  const tencentcloudCssMap = {};
  const delArr: number[] = [];

  // 直播记录表里有，但腾讯云直播记录没有，就需要删除直播记录表里的记录
  // 直播记录表里没有，如果腾讯云直播记录也没有，不需要处理；如果腾讯云直播记录有记录，则需要添加一条记录给直播记录表
  res2.res?.OnlineInfo?.forEach((item) => {
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(item.StreamName)?.[1];
    tencentcloudCssMap[roomId!] = 1;
  });

  res1.rows.forEach((item) => {
    const { live_room_id } = item;
    if (live_room_id) {
      res1Map[`${live_room_id}`] = 1;
      if (!tencentcloudCssMap[`${live_room_id}`]) {
        delArr.push(Number(live_room_id));
      }
    }
  });
  console.log('定时任务删除cdn直播记录', delArr);
  if (delArr.length) {
    liveController.common.deleteByLiveRoomId(delArr);
  }
};

export const srsMain = async () => {
  const res1 = await liveController.common.findAll({
    platform: LivePlatformEnum.srs,
  });
  const res2 = await srsController.common.getApiV1Streams({
    start: 0,
    count: 9999,
  });
  const res1Map = {};
  res1.rows.forEach((item) => {
    const { live_room_id } = item;
    if (live_room_id) {
      res1Map[`${live_room_id}`] = 1;
    }
  });
  const delArr: number[] = [];
  res2.streams?.forEach((item) => {
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(item.name.replace('.m3u8', ''))?.[1];
    if (!res1Map[`${roomId!}`]) {
      delArr.push(Number(roomId));
    }
  });
  console.log('定时任务删除srs直播记录', delArr);
  if (delArr.length) {
    liveController.common.deleteByLiveRoomId(delArr);
  }
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

// 每3分钟执行
rule.minute = allMinuteArr.filter((v) => v % 3 === 0);
rule.second = 0;

// 每5秒执行
// rule.minute = allMinuteArr.filter((v) => v % 1 === 0);
// rule.second = allSecondArr.filter((v) => v % 5 === 0);

export const startLiveRoomIsLiveSchedule = () => {
  if (PROJECT_ENV === 'prod') {
    nodeSchedule.scheduleJob(SCHEDULE_TYPE.liveRoomIsLive, rule, () => {
      console.log(chalkINFO(`执行${SCHEDULE_TYPE.liveRoomIsLive}定时任务`));
      srsMain();
      tencentcloudCssMain();
    });
  }
};
