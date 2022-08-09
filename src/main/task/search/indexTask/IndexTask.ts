import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { Indexer } from '../../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../../modules/searchEngine/indexer/IIndexer';
import { workspace } from '../../../workspace/Workspace';
import { BlackListKeyWordIndex } from '../../../workspace/tree/blackList/BlackListKeyWordIndex';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import {Project} from "../../../workspace/Project";

export class IndexTask implements ITask<Electron.WebContents, any> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }


  public async run(): Promise<any> {
    const project = workspace.getOpenProject();
    if (!project) throw new Error('Not project opened');
    const f = this.project.getTree().getRootFolder().getFiles(new BlackListKeyWordIndex());
    const paths = f.map((fi) => fi.path);
    const files = await modelProvider.model.file.getAll(QueryBuilderCreator.create(paths));
    const indexer = new Indexer();
    const filesToIndex = this.fileAdapter(files);
    const index = indexer.index(filesToIndex);
    const projectPath = this.project.metadata.getMyPath();
    await indexer.saveIndex(index, `${projectPath}/dictionary/`);
  }

  private fileAdapter(modelFiles: any): Array<IIndexer> {
    const filesToIndex = [];
    const p = workspace.getOpenProject();
    const scanRoot = p.metadata.getScanRoot();
    modelFiles.forEach((file: any) => {
      filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
    });
    return filesToIndex;
  }
}
