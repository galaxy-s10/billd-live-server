import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { QQ_EMAIL_USER } from '@/config/secret';
import {
  MONIT_JOB,
  MONIT_TYPE,
  PROJECT_ENV,
  QINIU_CDN_DOMAIN,
} from '@/constant';
import otherController from '@/controller/other.controller';
import qiniuController from '@/controller/qiniuData.controller';
import monitService from '@/service/monit.service';
import { formatMemorySize } from '@/utils';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';
import qiniuModel from '@/utils/qiniu';
import axios from '@/utils/request';

const oneByte = 1;
const oneKb = oneByte * 1024;
const oneMb = oneKb * 1024;
const oneGb = oneMb * 1024;
const threshold = oneGb * 5; // 七牛云阈值，达到5gb就报错

export const main = () => {
  qiniuController
    .monitCDN()
    .then(
      // @ts-ignore
      async ({
        allDomainNameFlux,
        start,
        end,
      }: {
        allDomainNameFlux: number;
        start: string;
        end: string;
      }) => {
        const info = `${start}至${end}期间使用的七牛云cdn流量：${formatMemorySize(
          allDomainNameFlux
        )}，阈值：${formatMemorySize(threshold)}`;
        if (allDomainNameFlux > threshold) {
          console.log(chalkWARN('七牛云cdn流量达到阈值，停掉cdn'));
          const domain = QINIU_CDN_DOMAIN;
          try {
            const reqUrl = `https://api.qiniu.com/domain/${domain}/offline`;
            const token = qiniuModel.getAccessToken(reqUrl);
            await axios.post(
              reqUrl,
              {},
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: `${token}`,
                },
              }
            );
            const str = '下线域名成功！（达到阈值，停掉cdn）';
            console.log(chalkSUCCESS(info));
            monitService.create({ type: MONIT_TYPE.QINIU_CDN, info: str });
            otherController.sendEmail(QQ_EMAIL_USER, str, str);
          } catch (error) {
            const err = '下线域名报错！（达到阈值，停掉cdn）';
            console.log(chalkERROR(err));
            console.log(error);
            monitService.create({ type: MONIT_TYPE.QINIU_CDN, info: err });
            otherController.sendEmail(QQ_EMAIL_USER, err, err);
          }
        } else {
          monitService.create({ type: MONIT_TYPE.QINIU_CDN, info });
        }
      }
    )
    .catch((err) => {
      console.log(err);
    });
};

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

// 每30分钟执行
rule.minute = allMinuteArr.filter((v) => v % 30 === 0);
rule.second = 0;

// 监控七牛云cdn流量，最近一周内，使用流量超过2g就邮件提示（TODO）/使用流量超过5g就停掉cdn服务
export const monitQiniuCDNJob = () => {
  console.log(chalkSUCCESS('监控任务: 七牛云cdn定时任务启动！'));
  const monitJobName = MONIT_JOB.QINIUCDN;
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
