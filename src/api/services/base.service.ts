import { ResponseStatus } from '../Response';

export class BaseService {
  public response(response) {
    if (response.status === ResponseStatus.FAIL) {
      throw new Error(response.message);
    }
    return response.data;
  }
}
