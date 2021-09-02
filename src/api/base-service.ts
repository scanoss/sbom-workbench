import { ResponseStatus } from '../main/Response';

export class BaseService {
  public response(response) {
    if (response.status === ResponseStatus.FAIL) {
      throw new Error(response.message);
    }
    return response.data;
  }
}
