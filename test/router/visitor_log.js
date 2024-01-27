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
const baseUrl = 'https://api.gatsby1680.com';
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
  const result = await autocannon({
    url: `${baseUrl}/visitor_log/analysis?orderName=format_date&orderBy=desc&rangTimeType=format_date&rangTimeStart=1705398646938&rangTimeEnd=1706003446938&pageSize=10&nowPage=1`,
    method: 'GET',
    connections: 10, // 并发连接数。可选默认值：10
    pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
    duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
    headers: {
      'Content-Type': 'application/json',
      Authorization: `
      Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
    },
  });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/analysis_minute_ten?orderName=format_date&orderBy=asc&rangTimeType=format_date&rangTimeStart=1705916907349&rangTimeEnd=1706003307349`,
  //   method: 'GET',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `
  //     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
  //   },
  // });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/get_user_visit_record?user_id=1&orderName=format_date&orderBy=desc&rangTimeType=created_at&rangTimeStart=1705398445444&rangTimeEnd=1706003245444&pageSize=10&nowPage=1`,
  //   method: 'GET',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `
  //     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
  //   },
  // });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/get_ip_visit_record?ip=127.0.0.1&orderName=format_date&orderBy=desc&rangTimeType=created_at&rangTimeStart=1705397887371&rangTimeEnd=1706002687371&pageSize=10&nowPage=1`,
  //   method: 'GET',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `
  //     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
  //   },
  // });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/list2?orderName=created_at&orderBy=desc&rangTimeType=created_at&rangTimeStart=1705394885882&rangTimeEnd=1705999685882&live_room_id=7&pageSize=10&nowPage=1`,
  //   method: 'GET',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 20, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `
  //     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
  //   },
  // });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/update_duration`,
  //   method: 'POST',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `
  //     Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
  //   },
  //   body: JSON.stringify({
  //     visitor_log_id: 1232,
  //     is_mobile: 0,
  //     duration: 5,
  //     live_room_id: 7,
  //     group_user_id: 5,
  //   }),
  // });
  // const result = await autocannon({
  //   url: `${baseUrl}/visitor_log/create`,
  //   method: 'POST',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     user_agent:
  //       'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  //     is_mobile: 0,
  //     live_room_id: 7,
  //     parent_user_id: 5,
  //     group_user_id: 5,
  //   }),
  // });
  console.log(result);
  if (result) {
    let codeStr = '状态码:';
    let latencyStr = '响应延迟:';
    let requestsStr = '每秒发送的请求数:';
    let throughputStr = '每秒响应数据吞吐量:';

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
    console.log(`压测开始时间:${new Date().toLocaleString()} `);
    console.log(`路径:${result.url};`);
    console.log();
    console.log(codeStr);
    console.log();
    console.log(latencyStr);
    console.log();
    console.log(throughputStr);
    console.log();
    console.log(requestsStr);
    console.log(
      `压测结束时间:${new Date().toLocaleString()},总共持续${result.duration}秒`
    );
  }
}
foo();
