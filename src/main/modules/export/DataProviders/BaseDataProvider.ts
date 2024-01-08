import { ExportSource } from '../../../../api/types';

export class BaseDataProvider {
  protected source: ExportSource;

  constructor(source: ExportSource) {
    this.source = source;
  }

  protected getSource() {
    return this.source;
  }
}
