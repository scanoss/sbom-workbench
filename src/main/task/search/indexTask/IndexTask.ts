import { EventEmitter } from 'events';
import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { Indexer } from '../../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../../modules/searchEngine/indexer/IIndexer';
import { workspace } from '../../../workspace/Workspace';

export class IndexTask extends EventEmitter implements ITask<Electron.WebContents, any> {
  public async run(event: Electron.WebContents): Promise<any> {
    const files = await modelProvider.model.file.getAll(null);
    const indexer = new Indexer(event);
    const filesToIndex = this.fileAdapter(files);
    const index = indexer.index(filesToIndex);
    const projectPath = workspace.getOpenedProjects()[0].metadata.getMyPath();
    await indexer.saveIndex(index, `${projectPath}/dictionary/`);
  }

  private fileAdapter(modelFiles: any): Array<IIndexer> {
    const filesToIndex = [];
    const p = workspace.getOpenedProjects()[0];
    const scanRoot = p.metadata.getScanRoot();
    modelFiles.forEach((file: any) => {
      if (file.filter !== 'FILTERED') filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
    });
    return filesToIndex;
  }
}
