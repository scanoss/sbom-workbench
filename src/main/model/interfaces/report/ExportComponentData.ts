export interface ExportComponentData {
  component: string;
  vendor: string | null;
  purl: string;
  version: string;
  detected_licenses: string;
  concluded_licenses: string;
  url: string;
  url_hash: string | null;
  download_url: string | null;
  unique_detected_licenses?: Array<string>;
  unique_concluded_licenses?: Array<string>;
}
