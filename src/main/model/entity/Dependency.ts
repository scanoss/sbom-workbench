export class Dependency {

  dependencyId: number;

  fileId: number;

  purl: string;

  version: string;

  scope: string;

  rejectedAt: string;

  licenses: Array<string>;

  component: string;

  originalVersion: string;

  originalLicense: Array<string>;

}
