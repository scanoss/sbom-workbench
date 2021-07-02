export class AbstractFilter {
  // path: string | undefined;
  condition: string;

  value: string;

  ftype: string;

  constructor(condition: string, value: string) {
    this.condition = condition;
    this.value = value;
    this.ftype = 'NONE';
  }

  evaluate(path: string): boolean {
    return true;
  }
}
