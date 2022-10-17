import { Project } from '../../workspace/Project';
import { treeService } from '../../services/TreeService';
import { Scanner } from '../scanner/types';

export class IndexTreeTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  getName(): string {
    return 'Indexing';
  }

  isCritical(): boolean {
    return true;
  }

  run(): Promise<boolean> {
    const tree = treeService.init(
      this.project.getMyPath(),
      this.project.metadata.getScanRoot()
    );
    const summary = tree.getSummarize();
    this.project.filesToScan = summary.files;
    this.project.filesSummary = summary;
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.metadata.setFileCounter(summary.include);
    this.project.setTree(tree);
    this.project.save();
    return Promise.resolve(undefined);
  }
}
