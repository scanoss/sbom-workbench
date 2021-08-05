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
import { mapFiles } from '../../../../utils/scan-util';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { inventoryService } from '../../../../api/inventory-service';
import { setFile } from '../../actions';
import { DIALOG_ACTIONS } from '../../../context/types';
import { resultService } from '../../../../api/results-service';
import { Skeleton } from '@material-ui/lab';

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

  const { file } = state;

  const [matchInfo, setMatchInfo] = useState<any[] | null>(null);
  const [inventories, setInventories] = useState<Inventory[] | null>(null);
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
  const [ossLines, setOssLines] = useState<number[] | null>([]);
  const [lines, setLines] = useState<number[] | null>([]);
  const [fullFile, setFullFile] = useState<boolean | null>(null);

  const init = () => {
    setMatchInfo(null);
    setInventories(null);
    setFullFile(false);
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

  const getResults = async () => {
    const { data } = await resultService.get(file);
    setMatchInfo(mapFiles(data));
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
      await attachFile(inventory.id, selFiles);
      setInventories((previous) => [...previous, inventory]); // TODO: full update
    }

    getResults();
  };

  const onIdentifyPressed = async (result) => {
    const inv = {
      component: result.component.name,
      version: result.component.version,
      url: result.component.url,
      purl: result.component.purl,
      license: result.component.licenses[0]?.name,
      usage: result.type,
    };

    create(inv, [result.id]);
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
    const { data } = await inventoryService.get({ id: inventory.id });
    const fileResult = data?.files.find((item) => item.path === file);
    console.log(fileResult);
    if (fileResult) {
      await detachFile(inventory.id, [fileResult.id]);
      getInventories();
      getResults();
    }
  };

  const onDetailPressed = async (result) => {
    console.log(result);
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
      const full = currentMatch?.lines === 'all';
      setFullFile(full);
      if (!full) loadRemoteFile(currentMatch.md5_file);
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
            <>
              <div className="match-title">
                <h2 className="header-subtitle back">
                  <IconButton onClick={() => history.goBack()} component="span">
                    <ArrowBackIcon />
                  </IconButton>
                  { inventories?.length === 0 && matchInfo?.length === 0 ? 'No match found' : 'Matches' }
                </h2>
              </div>
              <header className="match-info-header">

                { matchInfo && inventories ?
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
                              component: match.component.name,
                              version: match.component.version,
                              usage: match.type,
                              license: match.component.licenses[0]?.name,
                              url: match.component.url,
                              purl: match.component.purl,
                            }}
                            status={match.status}
                            onSelect={() => setCurrentMatch(matchInfo[index])}
                            onAction={(action) => onAction(action, match)}
                          />
                        ))}
                    </div>
                  </section>
                  : <Skeleton variant="rect" width="50%" height={60} style={{marginBottom: 34}} />
                }

                <div className="info-files">
                  <LabelCard label="Source File" subLabel={file} status={null} />
                  { matchInfo && currentMatch && <LabelCard label='Component File' subLabel={currentMatch.file} status={null} /> }
                </div>
              </header>
            </>
        </header>

        {fullFile ? (
          <main className="editors-full app-content">
            <div className="editor">
              {matchInfo && localFileContent?.content ? (
                <MemoCodeEditor content={localFileContent.content} highlight={lines} />
              ) : null}
            </div>
          </main>
        ) : (
          <main className="editors app-content">
            <div className="editor">
              {matchInfo && localFileContent?.content ? (
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
