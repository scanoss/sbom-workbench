export class ExportControl {
  purl: string;

  version: string;

  hints: Array<Hint>;
}

export interface Hint {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  purl: string;
}

export interface ExportControlSummary {
  categorySummary: Record<string, number>;
  total: number;
}
