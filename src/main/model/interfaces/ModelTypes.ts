export interface Vulnerability{
  cve: string,
  source:string,
  severity:string,
  introduced:string,
  reported:string,
  patched:string,
  summary:string,
}

export interface ComponentVulnerability{
  purl:string;
  vulnerabilities: Array<Vulnerability>;
}
