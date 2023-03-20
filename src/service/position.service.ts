import { GAODE_WEB_IP_KEY, GAODE_WEB_IP_URL } from '@/config/secret';
import { IIpdata } from '@/interface';
import axios from '@/utils/request';

class PositionService {
  /**
   * country 国家 国家（或地区），中文。高德v3版查不了这个了。
   * province 省份 省（二级），中文。
   * city 城市 市（三级），中文。
   * district 区县 区（四级），中文。高德v3版查不了这个了。
   * isp 运营商 如电信、联通、移动。高德v3版查不了这个了。
   * location 经纬度 如 116.480881,39.989410。高德v3版查不了这个了。
   * Ip IP地址 提交的 Ipv4/ Ipv6地址。高德v3版查不了这个了。
   * adcode 城市的adcode编码。
   * rectangle 所在城市范围的左下右上对标对。
   * info 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。
   * infocode 返回状态说明,10000代表正确,详情参阅info状态表。
   * status 值为0或1,0表示失败；1表示成功。
   */

  async get(ip?: string) {
    if (!ip || ip === '127.0.0.1') {
      return {
        info: 'OK',
        infocode: '10000',
        status: '1',
        province: 'localhost',
        city: 'localhost',
        adcode: 'localhost',
        rectangle: 'localhost',
      };
    }
    const data: IIpdata = await axios.get(GAODE_WEB_IP_URL, {
      headers: { Accept: 'application/json' },
      params: { key: GAODE_WEB_IP_KEY, ip },
    });
    // const data: IIpdata = await new Promise((resolve) => {
    //   request(
    //     {
    //       url: GAODE_WEB_IP_URL,
    //       method: 'GET',
    //       qs: {
    //         key: GAODE_WEB_IP_KEY,
    //         ip,
    //       },
    //     },
    //     (error, response, body) => {
    //       resolve({ ...JSON.parse(body), ip });
    //     }
    //   );
    // });
    return data;
  }
}

export default new PositionService();
