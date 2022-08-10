import {Vulnerability} from "../entity/Vulnerability";


export interface ComponentVulnerability{
  purl:string;
  vulnerabilities: Array<Vulnerability>;
}
