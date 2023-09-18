import { exec } from 'child_process';

export const webmPushProcess = (data: {
  listTxt: string;
  rtmpUrl: string;
  token: string;
}) => {
  const cmd = `ffmpeg -stream_loop -1 -readrate 1 -f concat -safe 0 -i '${data.listTxt}' -vcodec h264 -acodec aac -f flv '${data.rtmpUrl}?token=${data.token}'`;
  console.log(cmd, 'webmPushProcess');
  exec(cmd);
};
// cmd({
//   listTxt: '/Users/huangshuisheng/Movies/webm/qlz.txt',
//   rtmpUrl:
//     'rtmp://localhost/livestream/roomId___102?token=93a5708fb0e3a5c03083f83c41b3cdad&type=3',
// });
