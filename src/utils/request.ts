import axios from 'axios';

import type { Axios, AxiosRequestConfig } from 'axios';

export type MyAxiosPromise<T = any> = Promise<T>;

interface MyAxiosInstance extends Axios {
  (config: AxiosRequestConfig): MyAxiosPromise;
  (url: string, config?: AxiosRequestConfig): MyAxiosPromise;
}

class MyAxiosClass {
  // axios 实例
  instance: MyAxiosInstance;

  constructor(config: AxiosRequestConfig) {
    // @ts-ignore
    this.instance = axios.create(config);

    // 请求拦截器
    this.instance.interceptors.request.use(
      (cfg) => {
        return cfg;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const { data } = response;
        return data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig<any> | undefined
  ): MyAxiosPromise<T> {
    return this.instance.get(url, config);
  }

  post<T = any>(
    url: string,
    data?: Record<string, unknown> | undefined,
    config?: AxiosRequestConfig
  ): MyAxiosPromise<T> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(
    url: string,
    data?: Record<string, unknown> | undefined,
    config?: AxiosRequestConfig
  ): MyAxiosPromise<T> {
    return this.instance.put(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): MyAxiosPromise<T> {
    return this.instance.delete(url, config);
  }
}

export const myaxios = new MyAxiosClass({
  timeout: 5000,
});
