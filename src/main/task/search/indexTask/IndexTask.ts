import log from 'electron-log';
import { Scanner } from 'main/task/scanner/types';
import i18next from 'i18next';
import path from 'path';
import { modelProvider } from '../../../services/ModelProvider';
import { projectService } from '../../../services/ProjectService';
import { Indexer } from '../../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../../modules/searchEngine/indexer/IIndexer';
import { searcher } from '../../../modules/searchEngine/searcher/Searcher';
import { workspace } from '../../../workspace/Workspace';
import { BlackListKeyWordIndex } from '../../../workspace/tree/blackList/BlackListKeyWordIndex';
import { Project } from '../../../workspace/Project';
import { ScannerStage } from '../../../../api/types';
import { CollectFilesVisitor } from '../../../workspace/tree/visitor/CollectFilesVisitor';
import { SEARCH_INDEX_FOLDER } from '../../../../shared/utils/search-utils';

export class IndexTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.SEARCH_INDEX,
      label: i18next.t('Title:CreatingSearchIndex'),
      isCritical: false,
    };
  }

  public async run(): Promise<boolean> {
    log.info('[ IndexTask init ]');
    if (!workspace.getOpenProject()) throw new Error('Not project opened');
    const allExtensions = this.project.metadata.getScannerConfig()?.allExtensions ?? false;
    const collector = new CollectFilesVisitor(new BlackListKeyWordIndex({ allExtensions }));
    this.project.getTree().getRootFolder().accept<void>(collector);
    const paths = new Set(collector.files.map((fi) => fi.getPath()));

    const files = (await modelProvider.model.file.getAllPaths()).filter((f) => paths.has(f.path));
    const projectPath = this.project.metadata.getMyPath();
    const dictionaryPath = path.join(projectPath, SEARCH_INDEX_FOLDER);
    const indexer = new Indexer();
    const index = await indexer.index(this.fileAdapter(files), projectService.getSourceCodeBasePath());
    await indexer.saveIndex(index, dictionaryPath);
    // The project may have been closed while indexing; saving it would persist its released tree.
    if (workspace.getOpenProject() !== this.project) return true;
    searcher.closeIndex();
    this.project.save();
    return true;
  }

  private fileAdapter(modelFiles: Array<{ id: number; path: string }>): Array<IIndexer> {
    return modelFiles.map((file) => ({ fileId: file.id, path: file.path }));
  }
}
