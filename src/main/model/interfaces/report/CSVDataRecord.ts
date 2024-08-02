export interface CSVDataRecord {
    inventory_id: number;
    path: string;
    usage: string;
    detected_component: string;
    concluded_component: string;
    detected_purl: string;
    concluded_purl: string;
    detected_version: string;
    concluded_version: string;
    latest_version: string;
    detected_license: string;
    concluded_license: string;
  }