import { Vulnerability } from "../entity/Vulnerability";


export interface ComponentVulnerability {
  purl: string;
  vulnerabilitiesList: Array<{
    id: string;

    cve: string;

    source: string;

    severity: string;

    published: string;

    modified: string;

    summary: string;
  }>;
}
