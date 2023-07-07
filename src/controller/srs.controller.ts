import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { SRS_CONFIG } from '@/config/secret';
import { ISrsRTC } from '@/interface';
import axios from '@/utils/request';

class SRSController {
  rtcV1Publish = async (ctx: ParameterizedContext, next) => {
    const { api, clientip, sdp, streamurl, tid }: ISrsRTC = ctx.request.body;
    const res = await axios.post(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/rtc/v1/publish/`,
      { api, clientip, sdp, streamurl, tid }
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  rtcV1Play = async (ctx: ParameterizedContext, next) => {
    const { api, clientip, sdp, streamurl, tid }: ISrsRTC = ctx.request.body;
    const res = await axios.post(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/rtc/v1/play/`,
      { api, clientip, sdp, streamurl, tid }
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  apiV1StreamsGet = async (ctx: ParameterizedContext, next) => {
    const res = await axios.get(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/streams`
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  apiV1ClientsGet = async (ctx: ParameterizedContext, next) => {
    const res = await axios.get(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/clients`
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  apiV1StreamsDel = async (ctx: ParameterizedContext, next) => {
    const { clientid } = ctx.request.body;
    const res = await axios.delete(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientid}`
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };
}

export default new SRSController();
