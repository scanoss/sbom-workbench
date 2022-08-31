import { Vulnerability } from "../entity/Vulnerability";


export interface ComponentVulnerability {
  purl: string;
  vulnerabilitiesList: Array<Vulnerability>;
}
