import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { FileType, Inventory } from '@api/types';
import { mapFiles } from '@shared/utils/scan-util';
import { inventoryService } from '@api/services/inventory.service';
import { resultService } from '@api/services/results.service';
import { InventoryForm } from '@context/types';
import { getExtension } from '@shared/utils/utils';
import { fileService } from '@api/services/file.service';
import { useDispatch, useSelector } from 'react-redux';
import { createInventory, detachFile, ignoreFile, restoreFile } from '@store/inventory-store/inventoryThunks';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import * as FileUtils from '@shared/utils/file-utils';
import * as SearchUtils from '@shared/utils/search-utils';
import useSearchParams from '@hooks/useSearchParams';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import MatchInfoCard, { MATCH_INFO_CARD_ACTIONS } from '../../../../components/MatchInfoCard/MatchInfoCard';
import FileToolbar, { ToolbarActions } from '../../../../components/FileToolbar/FileToolbar';
import { workbenchController } from '../../../../../../controllers/workbench-controller';
import CodeViewer from '../../../../components/CodeViewer/CodeViewer';
import { CodeViewerManager } from './CodeViewerManager';
import NoMatchFound from '../../../../components/NoMatchFound/NoMatchFound';

const MemoCodeViewer = React.memo(CodeViewer);

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const highlightParam = useSearchParams().get('highlight');

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { path: scanBasePath, imported, summary } = useSelector(selectWorkbench);
  const { node } = useSelector(selectNavigationState);

  const file = node?.type === 'file' ? node.path : null;
  const highlight = highlightParam ? SearchUtils.getTermsFamily(highlightParam) : null;

  const [matchInfo, setMatchInfo] = useState<any[] | null>(null);
  const [inventories, setInventories] = useState<Inventory[] | null>(null);
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
  const [isDiffView, setIsDiffView] = useState<boolean>(false);

  const init = () => {
    setMatchInfo(null);
    setInventories(null);
    setIsDiffView(false);
    setLocalFileContent({ content: null, error: false });
    setRemoteFileContent({ content: null, error: false });

    getInventories();
    getResults();

    if (file) {
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

  const getInventories = async () => {
    const inv = await inventoryService.getAll({ files: [file] });
    setInventories(inv);
  };

  const getResults = async () => {
    const results = await resultService.get(file);
    setMatchInfo(mapFiles(results));
  };

  const create = async (defaultInventory, selFiles) => {
    const inventory = await dialogCtrl.openInventory(defaultInventory);
    if (!inventory) return;

    dispatch(
      createInventory({
        ...inventory,
        files: selFiles,
      })
    );

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
    const response = await dialogCtrl.openInventory({
      usage: 'file',
    });
    if (response) {
      const f = await fileService.get({ path: file });
      if (!f) return;
      await dispatch(
        createInventory({
          ...response,
          files: [f.fileId],
        })
      );
    }
  };

  const onIgnorePressed = async (result) => {
    dispatch(ignoreFile([result.id]));
  };

  const onRestorePressed = async (result) => {
    dispatch(restoreFile([result.id]));
  };

  const onDetachPressed = async (inventory) => {
    const inv = await inventoryService.get({ id: inventory.id });
    const fileResult = inv.files.find((item) => item.path === file);
    if (fileResult) {
      dispatch(detachFile([fileResult.id]));
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
      const diff = currentMatch?.type !== 'file';
      setIsDiffView(diff);
      if (diff || imported) loadRemoteFile(currentMatch.md5_file);
    }
  }, [currentMatch]);

  useEffect(() => {
    getInventories();
    getResults();
  }, [summary]);

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
                <Skeleton variant="rect" width="50%" height={58} style={{ marginBottom: 15 }} />
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
                              license:
                                match.component?.licenses.find((l) => l.spdxid === match.license[0])?.name ||
                                match.license[0],
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
                <FileToolbar
                  id={CodeViewerManager.LEFT}
                  label="Source File"
                  fullpath={`${scanBasePath}${file}`}
                  file={file}
                />
                {matchInfo && currentMatch && currentMatch.file ? (
                  <FileToolbar
                    id={isDiffView ? CodeViewerManager.RIGHT : CodeViewerManager.LEFT}
                    label="Component File"
                    fullpath={FileUtils.getFileURL(currentMatch)}
                    file={currentMatch.file}
                    actions={
                      FileUtils.canOpenURL(currentMatch)
                        ? [ToolbarActions.FIND, ToolbarActions.COPY_PATH, ToolbarActions.OPEN_IN_BROWSER]
                        : [ToolbarActions.FIND, ToolbarActions.COPY_PATH]
                    }
                  />
                ) : (
                  inventories?.length === 0 &&
                  matchInfo?.length === 0 && <NoMatchFound identifyHandler={onNoMatchIdentifyPressed} showLabel />
                )}
              </div>
            </header>
          </>
        </header>

        <main
          className={`
          editors
          app-content
          ${isDiffView ? 'diff-view' : ''}
          `}
        >
          <div className="editor">
            {/* TODO: we need to remove this IF statement. Should we keep editor instance to better performance and UX. Problem: editors not re-layout on changing file */}
            {localFileContent?.content || remoteFileContent?.content || imported ? (
              <MemoCodeViewer
                id={CodeViewerManager.LEFT}
                language={getExtension(file)}
                value={
                  localFileContent?.content ||
                  remoteFileContent?.content ||
                  (imported ? "// This project was imported. Source file can't be displayed." : '')
                }
                highlight={currentMatch?.lines || null}
                highlights={highlight || null}
              />
            ) : (
              <div className="file-loader">Loading local file</div>
            )}
          </div>

          {isDiffView && currentMatch && (
            <div className="editor">
              {remoteFileContent?.content ? (
                <MemoCodeViewer
                  id={CodeViewerManager.RIGHT}
                  language={getExtension(file)}
                  value={remoteFileContent.content || 't'}
                  highlight={currentMatch.oss_lines || null}
                  highlights={highlight || null}
                />
              ) : (
                <div className="file-loader">Loading remote file</div>
              )}
            </div>
          )}
        </main>
        {/*
          ) : imported ? (
            <NoLocalFile />
          ) : null}
         */}
      </section>
    </>
  );
};

export default Editor;
