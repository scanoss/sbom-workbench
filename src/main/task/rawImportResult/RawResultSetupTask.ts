import { Scanner } from '../scanner/types';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
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
    let isFirstEntry = true;

    // Start JSON object
    writeStream.write('{\n');

    // Create a transform stream that validates and writes entries
    const processTransform = new Transform({
      objectMode: true,
      transform({ key, value }, encoding, callback) {
        try {
          // Validate the entry
          const resultValidator = new ScanossResultValidator();
          resultValidator.validate({[key]: value});

          if (resultValidator.hasErrors()) {
            const errors = resultValidator.getErrors();
            const errorDetails = errors.map(err => `${err.cause}: ${err.message}`).join('; ');
            return callback(new Error(`Invalid SCANOSS scan result for '${key}': ${errorDetails}`));
          }

          // Normalize key
          const normalizedKey = key.startsWith('/') ? key : `/${key}`;

          // Format entry
          const comma = isFirstEntry ? '' : ',\n';
          isFirstEntry = false;
          const entry = `${comma}  ${JSON.stringify(normalizedKey)}: ${JSON.stringify(value, null, 2).split('\n').join('\n  ')}`;

          writeStream.write(entry);
          callback();
        } catch (error) {
          log.error('[ Error validating entry ]', key, error);
          callback(error instanceof Error ? error : new Error(String(error)));
        }
      }
    });

    try {
      // Use pipeline to properly propagate errors
      await pipeline(
        readStream,
        parser(),
        streamObject(),
        processTransform
      );

      // Close JSON object
      writeStream.write('\n}\n');
      writeStream.end();


      // Wait for write to finish
      await new Promise<void>((resolve, reject) => {
        writeStream.once('finish', resolve);
        writeStream.once('error', reject);
      });

      log.info('[ ResultFileTreeTask saveResults completed ]');
    } catch (error) {
      // Clean up on error
      readStream.destroy();
      writeStream.destroy();
      log.error('[ Error processing scan results ]', error);
      throw error;
    }
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
