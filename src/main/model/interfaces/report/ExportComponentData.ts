export interface ExportComponentData {
  component: string;
  vendor: string | null;
  purl: string;
  version: string;
  detected_licenses: string;
  concluded_licenses: string;
  url: string;
  unique_detected_licenses?: Array<string>;
  unique_concluded_licenses?: Array<string>;
}
