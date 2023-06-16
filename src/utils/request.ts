import axios from 'axios';

const service = axios.create({
  timeout: 5000,
});

// 请求拦截
service.interceptors.request.use(
  (config) => {
    // @ts-ignore
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default service;
