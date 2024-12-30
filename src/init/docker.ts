// eslint-disable-next-line
import './alias';
import './initFile';

import { dockerRunMysql } from '@/init/docker/Mysql';
import { dockerRunRabbitMQ } from '@/init/docker/RabbitMQ';
import { dockerRunRedis } from '@/init/docker/Redis';
import { dockerRunSRS } from '@/init/docker/SRS';
import { dockerIsInstalled } from '@/utils';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

const flag = dockerIsInstalled();
if (flag) {
  console.log(chalkSUCCESS('docker已安装'));
  dockerRunMysql(true);
  dockerRunRedis(true);
  dockerRunSRS(true);
  dockerRunRabbitMQ(true);
} else {
  console.log(chalkERROR('未安装docker！'));
}
