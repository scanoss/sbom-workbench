import { Filter } from './Filter';

export class GenericFilter extends Filter {
  private value: any;

  private key: any;

  constructor(key: any, value: any) {
    super();
    this.key = key;
    this.value = value;
  }

  public isValid(data: any): boolean {
    if (data[this.key] === this.value) {
      return true;
    }

    return false;
  }
}
