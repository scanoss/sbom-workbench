import { app } from 'electron';

export class ScannerCfg {
  // Client Timestamp
  CLIENT_TIMESTAMP = app.getVersion();

  // API URL
  API_URL = 'https://osskb.org/api/scan/direct';

  // Level of concurrency
  CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  TIMEOUT = 60000;

  // The maximum size for each .wfp file
  WFP_FILE_MAX_SIZE = 64 * 1000;
}
