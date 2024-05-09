import { Algorithms } from 'main/model/entity/Cryptography';
import { LocalCryptography } from 'main/model/entity/LocalCryptography';

interface GroupedCryptography {
  purl: string;
  versions: Array<string>;
  algorithms: Array<Algorithms>
}

export interface CryptoReportData {
  files: Array<LocalCryptography>;
  components: Array<GroupedCryptography>;
}
