/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { Transform } from 'stream';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';
import { Format, ExportResult } from '../Format';
import { ExportStatusCode } from '../../../../api/types';

export class Raw extends Format {
  constructor() {
    super();
    this.extension = '.json';
  }

  public async generate(): Promise<ExportResult> {
    const inputPath = this.repository.getRawFilePath();

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
      const writeStream = fs.createWriteStream(this.outputPath, { encoding: 'utf8' });

      let isFirst = true;

      writeStream.on('finish', () => {
        resolve({
          report: null,
          status: {
            code: ExportStatusCode.SUCCESS,
            info: { invalidPurls: [] },
          },
        });
      });

      writeStream.on('error', (err) => reject(err));
      readStream.on('error', (err) => reject(err));

      writeStream.write('{\n');

      const transformStream = new Transform({
        objectMode: true,
        transform(chunk, _encoding, callback) {
          const { key, value } = chunk;
          const transformedKey = key.charAt(0) === '/' ? key.substring(1) : key;
          const jsonValue = JSON.stringify(value, null, 2)
            .split('\n')
            .map((line, index) => (index === 0 ? line : `  ${line}`))
            .join('\n');

          const prefix = isFirst ? '' : ',\n';
          isFirst = false;

          callback(null, `${prefix}  "${transformedKey}": ${jsonValue}`);
        },
      });

      transformStream.on('end', () => {
        writeStream.write('\n}\n');
        writeStream.end();
      });

      readStream
        .pipe(parser())
        .pipe(streamObject())
        .pipe(transformStream)
        .pipe(writeStream, { end: false });
    });
  }

  public async save(path: string) {
    try {
      this.outputPath = path;
      await this.generate();
      return {
        success: true,
        message: 'Export successful',
        extension: this.extension,
        file: path,
        statusCode: ExportStatusCode.SUCCESS,
        info: { invalidPurls: [] },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Export not successful',
        extension: this.extension,
        file: path,
        statusCode: ExportStatusCode.FAILED,
        info: { invalidPurls: [] },
      };
    }
  }
}
