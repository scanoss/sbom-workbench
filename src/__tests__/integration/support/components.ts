/**
 * Catalog of fictional components used by integration tests.
 *
 * Each entry models the shape the SCANOSS engine returns for a single
 * component match. Tests reference these by name (`COMPONENTS.sbomWorkbench`)
 * to keep readability high; the underlying purl/version/file_hash values
 * are arbitrary but consistent so assertions can compare against them.
 *
 * To add a new component for a test, append an entry here.
 */

export interface ComponentMatch {
  component: string;
  version: string;
  purl: string;
  file_hash: string;
  vendor?: string;
  url?: string;
  licenses?: Array<{ name: string; source: string }>;
}

export const COMPONENTS = {
  sbomWorkbench: {
    component: 'sbom-workbench',
    version: 'v1.27.0-rc2',
    purl: 'pkg:github/scanoss/sbom-workbench',
    file_hash: 'cdb71e04d9a9c8f828f2bf51b0791539',
    vendor: 'scanoss',
    url: 'https://github.com/scanoss/sbom-workbench',
    licenses: [{ name: 'GPL-2.0-only', source: 'component_declared' }],
  },
  apiGo: {
    component: 'api.go',
    version: 'v1.6.3',
    purl: 'pkg:github/scanoss/api.go',
    file_hash: '75d53552fcdcbcde097066a370e556f1',
    vendor: 'scanoss',
    url: 'https://github.com/scanoss/api.go',
    licenses: [{ name: 'GPL-2.0-only', source: 'component_declared' }],
  },
} satisfies Record<string, ComponentMatch>;

/**
 * Build an engine-shaped result.json entry from a ComponentMatch. Defaults
 * mirror what a real scanoss-py output for a 100% file match looks like,
 * so consumers downstream see realistic data.
 */
export function buildResultEntry(filePath: string, match: ComponentMatch): Record<string, unknown> {
  return {
    id: 'file',
    matched: '100%',
    lines: 'all',
    oss_lines: 'all',
    file_hash: match.file_hash,
    source_hash: match.file_hash,
    file: filePath.replace(/^\//, ''),
    file_url: `https://api.scanoss.com/file_contents/${match.file_hash}`,
    component: match.component,
    version: match.version,
    latest: match.version,
    vendor: match.vendor ?? 'unknown',
    url: match.url ?? '',
    purl: [match.purl],
    licenses: match.licenses ?? [],
    copyrights: [],
    cryptography: [],
    dependencies: [],
    quality: [],
    vulnerabilities: [],
    health: {},
    server: {
      elapsed: '0.000s',
      flags: '0',
      hostname: 'test-mock',
      kb_version: { daily: '26.04.21', monthly: '26.03' },
      version: '5.4.25',
    },
    status: 'pending',
    url_hash: '',
    release_date: '',
    download_url: null,
  };
}
