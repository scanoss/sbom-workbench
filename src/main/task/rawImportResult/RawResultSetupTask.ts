import { Scanner } from '../scanner/types';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { Project } from 'main/workspace/Project';
import { ProjectSource, ScannerStage } from '../../../api/types';
import i18next from 'i18next';
import { modelProvider } from '../../services/ModelProvider';
import { licenseService } from '../../services/LicenseService';
import { ScanossResultValidator } from '../../modules/validator/ScanossResultValidator';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';

export class RawResultSetupTask implements Scanner.IPipelineTask {
  private project: Project;
  constructor(project: Project) {
    this.project = project;
  }

  private async processScanResults(): Promise<void> {
    log.info('[ ResultFileTreeTask saveResults ]');
    const scanRootPath = this.project.getScanRoot();
    const resultPath = path.join(this.project.getMyPath(), 'result.json');

    const readStream = fs.createReadStream(scanRootPath);
    const writeStream = fs.createWriteStream(resultPath);

    const pipeline = readStream
      .pipe(parser())
      .pipe(streamObject());

    return new Promise((resolve, reject) => {
      let isFirstEntry = true;
      let hasError = false;

      // Start JSON object
      writeStream.write('{\n');

      pipeline.on('data', ({ key, value }) => {
        try {
          // Create a new validator for each entry to avoid error accumulation
        /*  const entryValidator = new ScanossResultValidator();

          // Validate entry as it streams
          entryValidator.validateFilePath(key);
          entryValidator.validateFileResults(key, value);

          // Check if validation found errors
          if (entryValidator.hasErrors()) {
            const errors = entryValidator.getErrors();
            const errorDetails = errors.map(err => `${err.cause}: ${err.message}`).join('; ');
            throw new Error(`Invalid SCANOSS scan result for '${key}': ${errorDetails}`);
          }*/

          // Add '/' prefix if not present
          const normalizedKey = key.startsWith('/') ? key : `/${key}`;

          // Write entry to output stream
          if (!isFirstEntry) {
            writeStream.write(',\n');
          }
          writeStream.write(`  ${JSON.stringify(normalizedKey)}: ${JSON.stringify(value, null, 2).split('\n').join('\n  ')}`);
          isFirstEntry = false;
        } catch (error) {
          hasError = true;
          log.error('[ Error validating entry ]', key, error);
          pipeline.destroy();
          writeStream.destroy();
          reject(error);
        }
      });

      pipeline.on('end', () => {
        if (!hasError) {
          // Close JSON object
          writeStream.write('\n}\n');
          writeStream.end();

          writeStream.on('finish', () => {
            log.info('[ ResultFileTreeTask saveResults completed ]');
            resolve();
          });

          writeStream.on('error', (err) => {
            log.error('[ Error writing result file ]', err);
            reject(err);
          });
        }
      });

      pipeline.on('error', (err) => {
        hasError = true;
        log.error('[ Error processing scan results ]', err);
        writeStream.destroy();
        reject(err);
      });
    });
  }

  private async setProjectSource(){
    // Set project source
    this.project.metadata.setSource(ProjectSource.IMPORT_SCAN_RESULTS);
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.INDEX,
      label: i18next.t('Title:Indexing'),
      isCritical: true,
    };
  }

  public async run(): Promise<boolean> {
    await modelProvider.init(this.project.getMyPath());
    await licenseService.import();
    await this.processScanResults();
    await this.setProjectSource();
    await this.project.save();
    return true;
  }
}
