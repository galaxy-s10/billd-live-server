import { COMMON_ERROR_CODE, COMMON_HTTP_CODE } from '@/constant';

export class CustomError extends Error {
  httpStatusCode: number;

  errorCode: number;

  constructor(
    message = '服务器错误',
    httpStatusCode = COMMON_HTTP_CODE.serverError,
    errorCode = COMMON_ERROR_CODE.serverError
  ) {
    super();
    this.message = message;
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
  }
}
