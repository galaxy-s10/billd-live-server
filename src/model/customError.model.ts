import { ALLOW_HTTP_CODE, ERROR_BUSINESS_CODE } from '@/constant';

export class CustomError extends Error {
  statusCode: number;

  errorCode: number;

  constructor(
    message = '服务器错误',
    statusCode = ALLOW_HTTP_CODE.serverError,
    errorCode = ERROR_BUSINESS_CODE.serverError
  ) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
