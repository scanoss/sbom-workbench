export interface ResponseData {
  data?: any;
  message?: string;
}

export enum ResponseStatus {
  OK = 'ok',
  FAIL = 'fail',
}

export class Response {
  static ok(response: ResponseData = null) {
    return {
      status: ResponseStatus.OK,
      ...response,
    };
  }

  static fail(response: ResponseData = null) {
    return {
      status: ResponseStatus.FAIL,
      ...response,
    };
  }
}
