import { app } from 'electron';

export class ScannerCfg {
  // Client Timestamp
  CLIENT_TIMESTAMP = app.getVersion();

  // API URL
  API_URL = 'https://osskb.org/api/scan/direct';

  // Level of concurrency
  CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  TIMEOUT = 120000;

  // The maximum size for each .wfp file
  WFP_FILE_MAX_SIZE = 64 * 1000;

  // After reach x number of server responses persist files and emit event
  MAX_RESPONSES_IN_BUFFER = 50;

  DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 100;

  DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 50;

}
