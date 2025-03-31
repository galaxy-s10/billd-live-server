/* eslint-disable no-console */
const autocannon = require('autocannon');

function formatMemorySize(val, num = 2) {
  // bit:"比特"或"位",1byte=8bit
  const oneByte = 1;
  const oneKb = oneByte * 1024;
  const oneMb = oneKb * 1024;
  const oneGb = oneMb * 1024;
  const oneTb = oneGb * 1024;
  const format = (v) => v.toFixed(num);
  if (val < oneKb) {
    return `${format(val / oneByte)}byte`;
  }
  if (val < oneMb) {
    return `${format(val / oneKb)}KB`;
  }
  if (val < oneGb) {
    return `${format(val / oneMb)}MB`;
  }
  if (val < oneTb) {
    return `${format(val / oneGb)}GB`;
  }
  return `${format(val / oneTb)}TB`;
}

function objectToUrlParams(obj) {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    params.append(key, obj[key]);
  });

  return params.toString();
}

// const baseUrl = 'http://localhost:4300';
// const baseUrl = 'https://api.hsslive.cn';
// const baseUrl = 'https://live-api.hsslive.cn';
const codeMap = {
  '1xx': '1xx',
  '2xx': '2xx',
  '3xx': '3xx',
  '4xx': '4xx',
  '5xx': '5xx',
};
const map = {
  total: '总数',
  min: '最低值',
  max: '最高值',
  average: '平均值',
  stddev: '标准差',
};

async function foo() {
  console.log('开始压测...');
  const start = new Date().toLocaleString();
  const result = await autocannon({
    // url: `https://blog.codedogs.top`,
    // url: `http://localhost:7408/gwbeta/`,
    // url: `http://localhost:3300/article/list?orderName=created_at&orderBy=desc&types=&nowPage=1&pageSize=10`,
    // url: `https://api.hsslive.cn/prodapi/article/list?orderName=created_at&orderBy=desc&types=&nowPage=1&pageSize=20`,
    // url: `http://localhost:3000`,
    // url: `https://liveserver.jaygatsby1680.com/model/tb-message-record/addMessageRecord?messageContent=%7B%22user%22%3A%7B%22userId%22%3A596%2C%22role%22%3A6%2C%22roleObj%22%3Anull%2C%22nickName%22%3A%22Guests07424730%22%2C%22userUuid%22%3A%2202931680661%22%2C%22userHead%22%3A%22live%2Fimg%2Fdefaluthead%2Fhead.png%22%2C%22account%22%3Anull%2C%22passw+235235236+235235236%22%2C%22time%22%3A%222024-04-17+18%3A35%22%2C%22type%22%3A1%2C%22robot%22%3Anull%2C%22robotName%22%3A%22Robot%22%7D&messageRoom=20814584789&messageExam=0&messageUser=596&userinfo=%7B%22userId%22%3A596%2C%22role%22%3A6%2C%22roleObj%22%3Anull%2C%22nickName%22%3A%22Guests07424730%22%2C%22userUuid%22%3A%2202931680661%22%2C%22userHead%22%3A%22live%2Fimg%2Fdefaluthead%2Fhead.png%22%2C%22account%22%3Anull%2C%22password%22%3Anull%2C%22tel%22%3Anull%2C%22qq%22%3Anull%2C%22wx%22%3Anull%2C%22userDesc%22%3Anull%2C%22tgNum%22%3Anull%2C%22isJy%22%3Anull%2C%22isLook%22%3Anull%2C%22state%22%3A0%2C%22ipAddr%22%3A%22119.28.182.22%22%2C%22integral%22%3Anull%2C%22invalid%22%3A0%2C%22createdBy%22%3A0%2C%22createdUser%22%3Anull%2C%22fids%22%3A%220%22%2C%22createdTime%22%3A%222024-04-17+10%3A25%3A26%22%2C%22updatedTime%22%3A%222024-04-17+10%3A25%3A26%22%2C%22onlineRoom%22%3Anull%7D`,
    // url: `https://www.ldmnq.com`,
    // url: `https://www.xdyun.com/`,
    // url: `http://106.15.9.244:7409`,
    // url: `https://www.ldyuncs.com/`,
    // url: `https://www.funpg.net/cloud-phone`,
    // url: `http://localhost:3000/api/health`,
    // url: `http://localhost:3000`,
    // url: `http://localhost:7408/gwbeta/`,
    // url: `https://www.funpg.net`,
    // url: `https://www.abclive.cloud/`,
    // url: `http://www.ldyunpc.com`,
    // url: `https://www.funpg.net/categories`,
    // url: `https://www.funpg.net/api/health`,
    // url: `https://www.ldcloud.net`,
    // url: `https://live.hsslive.cn`,
    // url: `https://www.hsslive.cn`,
    // url: `https://nuxt2.hsslive.cn`,
    // url: `https://api.hsslive.cn/prodapi/tag/list`,
    // url: `https://live-api.hsslive.cn`,
    // url: `https://live-api.hsslive.cn/other/get_client_ip`, // 350左右
    // url: `https://live-api.hsslive.cn/signin_statistics/list?nowPage=50&pageSize=1&orderName=sum_nums,max_nums,recently_signin_time&orderBy=desc,desc,desc`,
    // url: `http://127.0.0.1:4300/other/get_client_ip`,
    // url: `http://127.0.0.1:4300/area/list?keyWord=%E6%B8%B8`,
    // url: `http://127.0.0.1:4300/area/list`,
    // url: `http://127.0.0.1:4300/area/live_room_list?nowPage=1&pageSize=2&id=1`,
    // url: `https://live-api.hsslive.cn/area/list?keyWord=%E6%B8%B8`, // 50左右
    // url: `http://127.0.0.1:4300`,
    // url: `https://live-api.hsslive.cn`,
    // url: `https://live-api.hsslive.cn/health/`,
    url: `https://live-api.hsslive.cn/area/live_room_list?id=47&live_room_is_show=0&nowPage=1&pageSize=50`,
    // url: `https://live-api.hsslive.cn/area/get_all_area?orderName=priority&orderBy=desc`,
    // url: `https://live-api.hsslive.cn/area/get_all_area_by_tree?orderName=priority&orderBy=desc&id=0`,
    // url: `http://127.0.0.1:3000`,
    method: 'GET',
    connections: 100, // 并发连接数。可选默认值：10
    pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
    duration: 2, // 运行的秒数。可以是时间字符串。可选默认值：10
    headers: {
      'user-agent': '',
    },
    body: JSON.stringify({ channelid: 17300, pchannelid: 17321, priceType: 0 }),
  });
  if (result) {
    let codeStr = '压测时间内返回的所有状态码:';
    let latencyStr = '响应延迟:';
    let throughputStr = '每秒响应数据吞吐量（TPS）:';
    let requestsStr = '每秒发送的请求数（QPS）:';

    Object.keys(result).forEach((key) => {
      if (Object.keys(codeMap).includes(key)) {
        const tmp = `${codeMap[key]}:${Math.floor(result[key])}; `;
        codeStr += tmp;
      }
    });
    Object.keys(result.latency).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${Math.floor(result.latency[key])}ms; `;
        latencyStr += tmp;
      }
    });
    Object.keys(result.requests).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${Math.floor(result.requests[key])}; `;
        requestsStr += tmp;
      }
    });
    Object.keys(result.throughput).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${formatMemorySize(result.throughput[key])}; `;
        throughputStr += tmp;
      }
    });
    console.log(`压测路径:${result.url};`);
    console.log();
    console.log(codeStr);
    console.log();
    console.log(latencyStr);
    console.log();
    console.log(throughputStr);
    console.log();
    console.log(requestsStr);
    console.log();
    console.log(
      `压测时间：${start} 至 ${new Date().toLocaleString()} ，总共持续${
        result.duration
      }秒`
    );
  }
}
foo();
