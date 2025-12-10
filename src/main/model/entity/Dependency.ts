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

export interface ModelDependencyManifest {
  fileId: number;
  path: string;
  identified: number;
  ignored: number;
  pending: number;
}
