interface ExternalRef {
  referenceCategory: string;
  referenceLocator: string;
  referenceType: string;
}

interface Checksum {
  algorithm: string;
  checksumValue: string;
}

interface CreationInfo {
  creators: string[];
  created: string;
  comment: string;
}

interface Package {
  name: string;
  SPDXID: string;
  versionInfo: string;
  downloadLocation: string;
  filesAnalyzed: boolean;
  supplier: string;
  homepage: string;
  licenseDeclared: string;
  licenseConcluded: string;
  copyrightText: string;
  externalRefs: ExternalRef[];
  checksums: Checksum[];
}

interface ExtractedLicenseInfo {
  licenseId: string;
  name: string;
  extractedText: string;
  comment: string;
}

interface SPDXDocument {
  spdxVersion: string;
  dataLicense: string;
  SPDXID: string;
  name: string;
  documentNamespace: string;
  creationInfo: CreationInfo;
  packages: Package[];
  documentDescribes: string[];
  hasExtractedLicensingInfos: ExtractedLicenseInfo[];
}
