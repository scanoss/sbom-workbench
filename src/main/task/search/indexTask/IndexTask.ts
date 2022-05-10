import { ITask } from "../../Task";
import { modelProvider } from "../../../services/ModelProvider";
import { Indexer } from "../../../modules/searchEngine/indexer/Indexer";
import { IndexerAdapter } from "../../../modules/searchEngine/indexer/IndexerAdapter";
import { IIndexer } from "../../../modules/searchEngine/indexer/IIndexer";
import { workspace } from "../../../workspace/Workspace";

export class IndexTask implements  ITask<void, any> {

  public async run(params: void): Promise<any> {
    const files = await modelProvider.model.file.getAll(null);
    const indexer = new Indexer();
    const indexerAdapter = new IndexerAdapter();
    const filesToIndex = this.fileAdapter(files);
    const index = indexer.index(filesToIndex);
    const projectPath = workspace.getOpenedProjects()[0].getMyPath();
    await indexer.saveIndex(index,`${projectPath}/dictionary/`);
  }

  private fileAdapter(modelFiles: any): Array<IIndexer> {
  const filesToIndex = [];
    const p = workspace.getOpenedProjects()[0];
    const scanRoot = p.getScanRoot();
  modelFiles.forEach((file: any) => {
      filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
    });
    return filesToIndex;
  }

}
