import { exec } from 'child_process';

export const mp4PushRtmp = (data: {
  listTxt: string;
  rtmpUrl: string;
  token: string;
}) => {
  const cmd = `ffmpeg -readrate 1 -f concat -safe 0 -i '${data.listTxt}' -vcodec h264 -acodec aac -r 20 -f flv '${data.rtmpUrl}?token=${data.token}'`;
  console.log(cmd, 'mp4PushRtmp');
  // ffmpeg -readrate 1 -f concat -safe 0 -i '/Users/huangshuisheng/Desktop/hss/galaxy-s10/billd-live-server/src/webm/roomId_101/list.txt' -vcodec h264 -acodec aac -r 20 -f flv 'rtmp://localhost/livestream/roomId___101?token=b6ef34e31dfdf2d16ebf8713ee756cc9'
  exec(cmd);
};

export const webmToMp4 = (data: { input: string; output: string }) => {
  const cmd = `ffmpeg -i ${data.input} -vcodec copy -acodec copy ${data.output}`;
  // console.log(cmd, 'webmToMp4');
  exec(cmd);
};
