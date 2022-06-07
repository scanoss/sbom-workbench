export interface IComponentVersionResult {
  component: string;
  url: string;
  purl: string;
  versions: Array<IVersion>;
}

export interface IVersion {
  version: string;
  licenses: Array<ILicense>;
}

export interface ILicense {
  name: string;
  spdxId: string;
  isSpdxApproved: boolean;
  url: string;
}
