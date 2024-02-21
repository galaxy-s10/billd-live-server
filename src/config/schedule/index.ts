import { startLiveRoomIsLiveSchedule } from '@/config/schedule/liveRoomIsLive/';
import { startVerifyStreamSchedule } from '@/config/schedule/verifyStream';

export const initSchedule = () => {
  startVerifyStreamSchedule();
  startLiveRoomIsLiveSchedule();
};
