import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import { IDependency } from 'scanoss';
import { IWorkbenchContext, WorkbenchContext } from '../../../../store';
import { DialogContext, IDialogContext } from '../../../../../../context/DialogProvider';
import { workbenchController } from '../../../../../../controllers/workbench-controller';
import { AppContext, IAppContext } from '../../../../../../context/AppProvider';
import { FileType, Inventory } from '../../../../../../../api/types';
import LabelCard from '../../../../components/LabelCard/LabelCard';
import MatchInfoCard, { MATCH_INFO_CARD_ACTIONS } from '../../../../components/MatchInfoCard/MatchInfoCard';
import { mapFiles } from '../../../../../../../shared/utils/scan-util';
import CodeEditor from '../../../../components/CodeEditor/CodeEditor';
import { inventoryService } from '../../../../../../../api/services/inventory.service';
import { resultService } from '../../../../../../../api/services/results.service';
import NoMatchFound from '../../../../components/NoMatchFound/NoMatchFound';
import { InventoryForm } from '../../../../../../context/types';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import { getExtension } from '../../../../../../../shared/utils/utils';
import { fileService } from '../../../../../../../api/services/file.service';
import CodeViewSelector from './components/CodeViewSelector/CodeViewSelector';
import DependencyTree from './components/DependencyTree/DependencyTree';
import NoLocalFile from './components/NoLocalFile/NoLocalFile';
import { dependencyService } from '../../../../../../../api/services/dependency.service';


const MemoCodeEditor = React.memo(CodeEditor);

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  const { state, dispatch, createInventory, ignoreFile, restoreFile, detachFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { imported } = state;

  const file = state.node?.type === 'file' ? state.node.path : null;

  const [matchInfo, setMatchInfo] = useState<any[] | null>(null);
  const [inventories, setInventories] = useState<Inventory[] | null>(null);
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
  const [fullFile, setFullFile] = useState<boolean>(null);
  const [dependencies, setDependencies] = useState<IDependency[]>(null);
  const [view, setView] = useState<'code' | 'graph'>('code');

  const init = () => {
    setMatchInfo(null);
    setInventories(null);
    setFullFile(false);
    setLocalFileContent({ content: null, error: false });
    setRemoteFileContent({ content: null, error: false });


    getInventories();
    getResults();


    if (file) {
      getDependencies(file);
      const dep = state.dependencies?.filesList?.find((d) => d.file === file)?.dependenciesList;
      setView(dep ? 'graph' : 'code');
      setDependencies(dep);
      loadLocalFile(file);
    }
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false });
      const content = await workbenchController.fetchLocalFile(`${scanBasePath}/${path}`);
      if (content === FileType.BINARY) throw new Error(FileType.BINARY);
      setLocalFileContent({ content, error: false });
    } catch (error) {
      setLocalFileContent({ content: null, error: true });
    }
  };

  const loadRemoteFile = async (path: string): Promise<void> => {
    try {
      setRemoteFileContent({ content: null, error: false });
      const content = await workbenchController.fetchRemoteFile(path);
      setRemoteFileContent({ content, error: false });
    } catch (error) {
      setRemoteFileContent({ content: null, error: true });
    }
  };

  const getDependencies = async (path: string): Promise<any> => {
    const dep = await dependencyService.getAll({ path });
    console.log (dep);
  }

  const getInventories = async () => {
    const inv = await inventoryService.getAll({ files: [file] });
    setInventories(inv);
  };

  const getResults = async () => {
    const results = await resultService.get(file);
    setMatchInfo(mapFiles(results));
  };

  const create = async (defaultInventory, selFiles) => {
    const inventory = await dialogCtrl.openInventory(defaultInventory, state.recentUsedComponents);
    if (!inventory) return;

    const newInventory = await createInventory({
      ...inventory,
      files: selFiles,
    });

    setInventories((previous) => [...previous, newInventory]);
    getResults();
  };

  const onIdentifyPressed = async (result) => {
    const inv: Partial<InventoryForm> = {
      component: result.component.name,
      version: result.version,
      url: result.component.url,
      purl: result.purl,
      spdxid: result.license ? result.license[0] : null,
      usage: result.type,
    };

    create(inv, [result.id]);
  };

  const onNoMatchIdentifyPressed = async (result) => {
    const response = await dialogCtrl.openInventory(
      {
        usage: 'file',
      },
      state.recentUsedComponents
    );
    if (response) {
      const id = await fileService.getIdFromPath(file);
      if (!id) return;
      await createInventory({
        ...response,
        files: [id],
      });
      getInventories();
      getResults();
    }
  };

  const onIgnorePressed = async (result) => {
    await ignoreFile([result.id]);
    getResults();
  };

  const onRestorePressed = async (result) => {
    await restoreFile([result.id]);
    getResults();
  };

  const onDetachPressed = async (inventory) => {
    const inv = await inventoryService.get({ id: inventory.id });
    const fileResult = inv.files.find((item) => item.path === file);
    if (fileResult) {
      await detachFile([fileResult.id]);
      getInventories();
      getResults();
    }
  };

  const onDetailPressed = async (result) => {
    history.push(`/workbench/identified/inventory/${result.id}`);
  };

  useEffect(() => {
    init();
  }, [file]);

  useEffect(() => {
    if (matchInfo) {
      setCurrentMatch(matchInfo[0]);
    } else {
      setCurrentMatch(null);
    }
  }, [matchInfo]);

  useEffect(() => {
    if (currentMatch) {
      const full = currentMatch?.type === 'file';
      setFullFile(full);
      if (!full || imported) loadRemoteFile(currentMatch.md5_file);
    }
  }, [currentMatch]);

  useEffect(() => {
    getInventories();
    getResults();
  }, [state.summary]);

  const onAction = (action: MATCH_INFO_CARD_ACTIONS, result: any = null) => {
    switch (action) {
      case MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY:
        onIdentifyPressed(result);
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE:
        onIgnorePressed(result);
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_RESTORE:
        onRestorePressed(result);
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_DETAIL:
        onDetailPressed(result);
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_DETACH:
        onDetachPressed(result);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <section id="editor" className="app-page">
        <header className="app-header">
          <Breadcrumb />
          <>
            <header className="match-info-header">
              {(!matchInfo || !inventories) && (
                <Skeleton variant="rect" width="50%" height={60} style={{ marginBottom: 18 }} />
              )}

              {matchInfo && inventories && (matchInfo.length > 0 || inventories.length > 0) && (
                <section className="content">
                  <div className="match-info-default-container">
                    {inventories.length > 0
                      ? inventories.map((inventory) => (
                          <MatchInfoCard
                            key={inventory.id}
                            selected={currentMatch === inventory}
                            match={{
                              component: inventory.component.name,
                              vendor: inventory.component?.vendor,
                              version: inventory.component.version,
                              usage: inventory.usage,
                              license: inventory.spdxid,
                              url: inventory.component.url,
                              purl: inventory.component.purl,
                            }}
                            status="identified"
                            onSelect={() => null}
                            onAction={(action) => onAction(action, inventory)}
                          />
                        ))
                      : matchInfo?.map((match, index) => (
                          <MatchInfoCard
                            key={match.id}
                            selected={currentMatch === match}
                            match={{
                              component: match.component?.name,
                              vendor: match.component?.vendor,
                              version: match.component?.version,
                              usage: match.type,
                              license: match.component?.licenses && match.component?.licenses[0]?.name,
                              url: match.component?.url,
                              purl: match.component?.purl,
                            }}
                            status={match.status}
                            onSelect={() => setCurrentMatch(matchInfo[index])}
                            onAction={(action) => onAction(action, match)}
                          />
                        ))}
                  </div>
                </section>
              )}

              <div className="info-files">
                <LabelCard label="Source File" file={file} status={null} />
                {matchInfo && currentMatch && currentMatch.file && (
                  <LabelCard label="Component File" status={null} file={currentMatch.file} />
                )}
              </div>
            </header>
          </>
        </header>

        {fullFile ? (
          <main className="editors editors-full app-content">
            <div className="editor">
              {matchInfo && (localFileContent?.content || remoteFileContent?.content) ? (
                <MemoCodeEditor
                  language={getExtension(file)}
                  content={localFileContent.content || remoteFileContent.content}
                  highlight={currentMatch?.lines || null}
                />
              ) : null}
            </div>
          </main>
        ) : (
          <main className="editors app-content">
            <div className="editor">
              {matchInfo && localFileContent?.content ? (
                <>
                  {dependencies && <CodeViewSelector active={view} setView={setView} />}
                  {view === 'code' ? (
                    <MemoCodeEditor
                      language={getExtension(file)}
                      content={localFileContent.content}
                      highlight={currentMatch?.lines || null}
                    />
                  ) : (
                    <DependencyTree dependencies={dependencies} />
                  )}
                </>
              ) : imported ? <NoLocalFile /> : null}
            </div>
            {inventories?.length === 0 && matchInfo?.length === 0 ? (
              <div className="editor">
                <NoMatchFound identifyHandler={onNoMatchIdentifyPressed} showLabel={!dependencies} />
              </div>
            ) : (
              <div className="editor">
                {currentMatch && remoteFileContent?.content ? (
                  <MemoCodeEditor
                    language={getExtension(file)}
                    content={remoteFileContent.content}
                    highlight={currentMatch?.oss_lines || null}
                  />
                ) : null}
              </div>
            )}
          </main>
        )}
      </section>
    </>
  );
};

export default Editor;
