import { ScanTask } from './ScanTask';
import { CodeDispatcher } from '../dispatcher/CodeDispatcher';
import { CodeScannerInputAdapter } from '../adapter/CodeScannerInputAdapter';
import { Project } from '../../../workspace/Project';

export class CodeScanTask extends ScanTask<CodeDispatcher, CodeScannerInputAdapter> {
  constructor(project: Project) {
    super(project, new CodeDispatcher(), new CodeScannerInputAdapter(project));
  }
}
