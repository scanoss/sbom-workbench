import { ExportStatusCode } from '../../../../api/types';
import { ExportResult, Format } from '../Format';
import { ExportRepository } from '../Repository/ExportRepository';
import { ExportRepositorySqliteImp } from '../Repository/ExportRepositorySqliteImp';
import { UnifiedDataRecord } from '../../../model/interfaces/report/UnifiedDataRecord';
import { isValidPurl } from '../helpers/exportHelper';
import { workspace } from '../../../workspace/Workspace';

const STATUS_PRIORITY: Record<string, number> = {
  IDENTIFIED: 3,
  ORIGINAL: 2,
  PENDING: 1,
};

interface Finding {
  usage: string;
  status: string;
  detected: {
    component: string;
    purl: string;
    version: string;
    license: string;
    url: string;
  };
  concluded: {
    component: string;
    purl: string;
    version: string;
    license: string;
    url: string;
  };
  latest_version: string;
  inventory_id: number | null;
  comment: string;
}

interface FileEntry {
  status: string;
  findings: Finding[];
}

interface UnifiedOutput {
  metadata: {
    format: string;
    version: string;
    exported_at: string;
    project: string;
    total_files: number;
    summary: {
      pending: number;
      identified: number;
      original: number;
    };
  };
  files: Record<string, FileEntry>;
}

export class UnifiedJson extends Format {
  constructor(exportRepository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(exportRepository);
    this.extension = '.json';
  }

  public async generate(): Promise<ExportResult> {
    const data = await this.repository.getAllUnifiedRecordFiles();
    const invalidPurls = new Set<string>();

    const filesMap = new Map<string, FileEntry>();

    for (const record of data) {
      this.trackInvalidPurls(record, invalidPurls);

      const finding = this.toFinding(record);

      if (!filesMap.has(record.path)) {
        filesMap.set(record.path, {
          status: record.status,
          findings: [finding],
        });
      } else {
        const entry = filesMap.get(record.path);
        entry.findings.push(finding);
        if ((STATUS_PRIORITY[record.status] || 0) > (STATUS_PRIORITY[entry.status] || 0)) {
          entry.status = record.status;
        }
      }
    }

    const files: Record<string, FileEntry> = {};
    const summary = { pending: 0, identified: 0, original: 0 };

    for (const [path, entry] of filesMap) {
      files[path] = entry;
      switch (entry.status) {
        case 'IDENTIFIED': summary.identified++; break;
        case 'ORIGINAL': summary.original++; break;
        default: summary.pending++; break;
      }
    }

    const project = workspace.getOpenedProjects()[0];
    const output: UnifiedOutput = {
      metadata: {
        format: 'unified-json',
        version: '1.0',
        exported_at: new Date().toISOString(),
        project: project.getProjectName(),
        total_files: filesMap.size,
        summary,
      },
      files,
    };

    const invalidPurlsArray = Array.from(invalidPurls);
    return {
      report: JSON.stringify(output, null, 2),
      status: {
        code: invalidPurlsArray.length > 0 ? ExportStatusCode.SUCCESS_WITH_WARNINGS : ExportStatusCode.SUCCESS,
        info: {
          invalidPurls: invalidPurlsArray,
        },
      },
    };
  }

  private toFinding(record: UnifiedDataRecord): Finding {
    return {
      usage: record.usage,
      status: record.status,
      detected: {
        component: record.detected_component,
        purl: record.detected_purl,
        version: record.detected_version,
        license: record.detected_license,
        url: record.detected_url,
      },
      concluded: {
        component: record.concluded_component,
        purl: record.concluded_purl,
        version: record.concluded_version,
        license: record.concluded_license,
        url: record.concluded_url,
      },
      latest_version: record.latest_version,
      inventory_id: record.inventory_id || null,
      comment: record.comment,
    };
  }

  private trackInvalidPurls(record: UnifiedDataRecord, invalidPurls: Set<string>): void {
    if (record.detected_purl && !isValidPurl(record.detected_purl)) {
      invalidPurls.add(record.detected_purl);
    }
    if (record.concluded_purl && !isValidPurl(record.concluded_purl)) {
      invalidPurls.add(record.concluded_purl);
    }
  }
}
