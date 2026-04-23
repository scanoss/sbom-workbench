export interface DependencyMatch {
  component: string;
  purl: string;
  version: string;
  license?: string;
  requirement?: string;
}

export const DEPENDENCIES = {
  lodash: {
    component: 'lodash',
    purl: 'pkg:npm/lodash',
    version: '4.17.21',
    license: 'MIT',
    requirement: '^4.17.21',
  },
  react: {
    component: 'react',
    purl: 'pkg:npm/react',
    version: '18.2.0',
    license: 'MIT',
    requirement: '^18.2.0',
  },
  axios: {
    component: 'axios',
    purl: 'pkg:npm/axios',
    version: '1.6.0',
    license: 'MIT',
    requirement: '^1.6.0',
  },
  requests: {
    component: 'requests',
    purl: 'pkg:pypi/requests',
    version: '2.31.0',
    license: 'Apache-2.0',
    requirement: '>=2.31.0',
  },
} satisfies Record<string, DependencyMatch>;

export function buildDependencyEntry(match: DependencyMatch) {
  return {
    component: match.component,
    purl: match.purl,
    version: match.version,
    requirement: match.requirement ?? `^${match.version}`,
    licensesList: match.license
      ? [{ name: match.license, spdxId: match.license, isSpdxApproved: true, url: '' }]
      : [],
    url: '',
    comment: '',
  };
}
