import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { useHistory, useLocation } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import { DialogContext, IDialogContext } from '../../../context/DialogProvider';
import { range } from '../../../../utils/utils';
import { workbenchController } from '../../../workbench-controller';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { Inventory } from '../../../../api/types';
import LabelCard from '../../components/LabelCard/LabelCard';
import MatchInfoCard, { MATCH_INFO_CARD_ACTIONS } from '../../components/MatchInfoCard/MatchInfoCard';
import { mapFile, mapFiles } from '../../../../utils/scan-util';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { inventoryService } from '../../../../api/inventory-service';
import { fileService } from '../../../../api/file-service';
import { setFile } from '../../actions';
import { DIALOG_ACTIONS } from '../../../context/types';

const MemoCodeEditor = React.memo(CodeEditor); // TODO: move inside editor page

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();
  const query = useQuery();

  const { state, dispatch, createInventory, ignoreFile, restoreFile, attachFile, detachFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { file, matchInfo } = state;

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
  const [fileStatus, setFileStatus] = useState<any | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [ossLines, setOssLines] = useState<number[] | null>([]);
  const [lines, setLines] = useState<number[] | null>([]);
  const [fullFile, setFullFile] = useState<boolean | null>(null);

  const init = () => {
    getInventories();
    // getFile();
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false });
      const content = await workbenchController.fetchLocalFile(scanBasePath + path);
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
    const { data } = await inventoryService.getAll({ files: [file] });
    setInventories(data);
  };

  const getFile = async () => {
    const { data } = await fileService.get({ path: file });
    setFileStatus(mapFile(data));
  };

  const create = async (defaultInventory, selFiles) => {
    const response = await inventoryService.getAll( {purl: defaultInventory.purl, version: defaultInventory.version} );
    const inventories = response.message || [];

    const showSelector = inventories.length > 0;
    let action = DIALOG_ACTIONS.NEW;
    let inventory;

    if (showSelector) {
      const response = await dialogCtrl.openInventorySelector(inventories);
      action = response.action;
      inventory = response.inventory;
    }

    if (action === DIALOG_ACTIONS.CANCEL) return;

    if (action === DIALOG_ACTIONS.NEW) {
      inventory = await dialogCtrl.openInventory(defaultInventory);
      if (!inventory) return;

      const newInventory = await createInventory({
        ...inventory,
        files: selFiles,
      });
      setInventories((previous) => [...previous, newInventory]);
    }

    if (action === DIALOG_ACTIONS.OK) {
      await attachFile(inventory.id, inventory.component.purl, inventory.component.version, selFiles);
      setInventories((previous) => [...previous, inventory]); // TODO: full update
    }

    getFile();
  };

  const onIdentifyPressed = async () => {
    const inv = {
      component: currentMatch?.component,
      version: currentMatch?.version,
      url: currentMatch?.url,
      purl: currentMatch?.purl[0],
      license: currentMatch?.licenses[0]?.name,
      usage: currentMatch?.id,
    };

    create(inv, [file]);
  };

  const onIgnorePressed = async () => {
    await ignoreFile([file]);
    getFile();
  };

  const onRestorePressed = async () => {
    await restoreFile([file]);
    getFile();
  };

  const onDetachPressed = async (inventory) => {
    await detachFile(inventory.id, inventory.component.purl, inventory.component.version, [file]);
    getInventories();
    getFile();
  };

  const onDetailPressed = async (result) => {
    history.push(`/workbench/inventory/${result.id}`);
  };

  useEffect(() => {
    dispatch(setFile(query.get('path')));
    const unlisten = history.listen((data) => {
      const path = new URLSearchParams(data.search).get('path');
      dispatch(setFile(path));
    });
    return unlisten;
  }, []);

  useEffect(() => {
    setLocalFileContent({ content: null, error: false });
    setRemoteFileContent({ content: null, error: false });

    if (file) {
      loadLocalFile(file);
    }
  }, [file]);

  useEffect(() => {
    init();
    if (matchInfo) {
      setCurrentMatch(matchInfo[0]);
    } else {
      setCurrentMatch(null);
    }
  }, [matchInfo]);

  useEffect(() => {
    if (currentMatch) {
      getFile();
      const full = currentMatch?.lines === 'all';
      setFullFile(full);
      if (!full) loadRemoteFile(currentMatch.file_hash);
    }
  }, [currentMatch]);

  useEffect(() => {
    if (!currentMatch) {
      return;
    }

    const linesOss =
      currentMatch.id === 'file'
        ? null
        : range(parseInt(currentMatch.oss_lines.split('-')[0], 10), parseInt(currentMatch.oss_lines.split('-')[1], 10));

    setOssLines(linesOss);

    const lineasLocales =
      currentMatch.id === 'file'
        ? null
        : range(parseInt(currentMatch.lines.split('-')[0], 10), parseInt(currentMatch.lines.split('-')[1], 10));

    setLines(lineasLocales);
  }, [currentMatch]);

  const onAction = (action: MATCH_INFO_CARD_ACTIONS, result: any = null) => {
    switch (action) {
      case MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY:
        onIdentifyPressed();
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE:
        onIgnorePressed();
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_RESTORE:
        onRestorePressed();
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
          {matchInfo ? (
            <>
              <div className="match-title">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon className="arrow-icon" />
                </IconButton>
                <span className="match-span">Match</span>
              </div>
              <header className="match-info-header">
                <section className="content">
                  <div className="match-info-default-container">
                    {inventories.length > 0
                      ? inventories.map((inventory) => (
                          <MatchInfoCard
                            key={inventory.id}
                            selected={currentMatch === inventory}
                            match={{
                              component: inventory.component.name,
                              version: inventory.component.version,
                              usage: inventory.usage,
                              license: inventory.license_name,
                              url: inventory.component.url,
                              purl: inventory.component.purl,
                            }}
                            status="identified"
                            onSelect={() => null}
                            onAction={(action) => onAction(action, inventory)}
                          />
                        ))
                      : matchInfo.map((match, index) => (
                          <MatchInfoCard
                            key={index}
                            selected={currentMatch === match}
                            match={{
                              component: match.component,
                              version: match.version,
                              usage: match.id,
                              license: match.licenses[0]?.name,
                              url: match.url,
                              purl: match.purl[0],
                            }}
                            status={fileStatus?.status}
                            onSelect={() => setCurrentMatch(matchInfo[index])}
                            onAction={onAction}
                          />
                        ))}
                  </div>
                </section>
                <div className="info-files">
                  <LabelCard label="Source File" subLabel={file} status={null} />
                  <LabelCard label="Component File" subLabel={currentMatch?.file} status={null} />
                </div>
              </header>
            </>
          ) : (
            <h1>No match found</h1>
          )}
        </header>

        {fullFile ? (
          <main className="editors-full app-content">
            <div className="editor">
              {currentMatch && localFileContent?.content ? (
                <MemoCodeEditor content={localFileContent.content} highlight={lines} />
              ) : null}
            </div>
          </main>
        ) : (
          <main className="editors app-content">
            <div className="editor">
              {currentMatch && localFileContent?.content ? (
                <MemoCodeEditor content={localFileContent.content} highlight={lines} />
              ) : null}
            </div>
            <div className="editor">
              {currentMatch && remoteFileContent?.content ? (
                <MemoCodeEditor content={remoteFileContent.content} highlight={ossLines} />
              ) : null}
            </div>
          </main>
        )}
      </section>
    </>
  );
};

export default Editor;
