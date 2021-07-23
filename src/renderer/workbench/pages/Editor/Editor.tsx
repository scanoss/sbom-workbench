import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import { DialogContext } from '../../../context/DialogProvider';
import { range } from '../../../../utils/utils';
import { workbenchController } from '../../../workbench-controller';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../../../api/types';
import LabelCard from '../../components/LabelCard/LabelCard';
import MatchInfoCard, { MATCH_INFO_CARD_ACTIONS } from '../../components/MatchInfoCard/MatchInfoCard';
import { componentService } from '../../../../api/component-service';
import { mapFile, mapFiles } from '../../../../utils/scan-util';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { inventoryService } from '../../../../api/inventory-service';
import { fileService } from '../../../../api/file-service';

const MemoCodeEditor = React.memo(CodeEditor); // TODO: move inside editor page

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  const { state, dispatch, createInventory, ignoreFile, restoreFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { openInventory } = useContext<any>(DialogContext);

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

  const handleAccept = async (inventory: Inventory) => {
    const inv = await createInventory({
      ...inventory,
      files: [file],
    });
    setInventories((previous) => [...previous, inv]);
    getFile();
  };

  const onIdentifyPressed = async () => {
    const inv = {
      component: currentMatch.component,
      version: currentMatch.version,
      url: currentMatch.url,
      purl: currentMatch.purl[0],
      license: currentMatch?.licenses[0]?.name,
      usage: currentMatch?.id,
    };
    openInventory(inv);
  };

  const onIgnorePressed = async () => {
    await ignoreFile([file]);
    getFile();
  };

  const onRestorePressed = async () => {
    await restoreFile([file]);
    getFile();
  };

  const onDetailPressed = async (result) => {
    history.push(`/workbench/inventory/${result.id}`);
  };

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
      if (!full)
        loadRemoteFile(currentMatch.file_hash);
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

  const onAction = (action: MATCH_INFO_CARD_ACTIONS, result) => {
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
                      ? inventories.map((inventory, index) => (
                          <MatchInfoCard
                            key={index}
                            selected={currentMatch === inventory}
                            match={{
                              component: inventory.component.name,
                              version: inventory.component.version,
                              usage: inventory.usage,
                            }}
                            status="identified"
                            onSelect={() => setCurrentMatch(matchInfo[index])}
                            onAction={(action) => onAction(action, inventory)}
                          />
                        ))
                      : matchInfo.map((match, index) => (
                          <MatchInfoCard
                            key={index}
                            selected={currentMatch === match}
                            match={{ component: match.component, version: match.version, usage: match.id }}
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

      <InventoryDialog onClose={handleAccept} />
    </>
  );
};

export default Editor;
