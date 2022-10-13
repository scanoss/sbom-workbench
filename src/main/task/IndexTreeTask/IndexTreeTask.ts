import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { treeService } from '../../services/TreeService';

export class IndexTreeTask implements ITask<Project, void> {
  run(project: Project): Promise<void> {
    const tree = treeService.init(
      project.getMyPath(),
      project.metadata.getScanRoot()
    );
    const summary = tree.getSummarize();
    project.filesToScan = summary.files;
    project.filesSummary = summary;
    project.filesNotScanned = {};
    project.processedFiles = 0;
    project.metadata.setFileCounter(summary.include);
    project.setTree(tree);
    project.save();
    return Promise.resolve(undefined);
  }
}
