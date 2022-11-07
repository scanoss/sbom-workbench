import fs from 'fs';
import log from 'electron-log';
import { modelProvider } from '../../services/ModelProvider';
import { Indexer } from '../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../modules/searchEngine/indexer/IIndexer';
import { BlackListKeyWordIndex } from '../../workspace/tree/blackList/BlackListKeyWordIndex';
import { Tree } from '../../workspace/tree/Tree';
import { QueryBuilderCreator } from '../../model/queryBuilder/QueryBuilderCreator';

export async function migration120(projectPath: string): Promise<void> {
  log.info('%cMigration 1.2.0 In progress...', 'color:green');
  await indexMigration(projectPath);
}

async function indexMigration(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  if (metadata.scan_root) {
    // Avoids create index on imported projects
    await modelProvider.init(projectPath);
    const project = await fs.promises.readFile(
      `${projectPath}/tree.json`,
      'utf8'
    );
    const a = JSON.parse(project);
    const tree = new Tree(metadata.name, projectPath,metadata.scan_root);
    tree.loadTree(a.tree.rootFolder);
    const f = tree.getRootFolder().getFiles(new BlackListKeyWordIndex());
    const paths = f.map((fi) => fi.path);
    const files = await modelProvider.model.file.getAll(
      QueryBuilderCreator.create(paths)
    );
    const indexer = new Indexer();
    const filesToIndex = fileAdapter(files, metadata.scan_root);
    const index = indexer.index(filesToIndex);
    await indexer.saveIndex(index, `${projectPath}/dictionary/`);
  }
}

function fileAdapter(modelFiles: any, scanRoot: string): Array<IIndexer> {
  const filesToIndex = [];
  modelFiles.forEach((file: any) => {
    filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
  });
  return filesToIndex;
}
