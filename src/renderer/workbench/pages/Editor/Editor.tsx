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

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  console.log('render');

  const { state, dispatch, createInventory, ignoreFile } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { setInventoryBool, inventoryBool } = useContext<any>(DialogContext);

  const { file, matchInfo } = state;

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
  const [fileStatus, setFileStatus] = useState<any | null>(null);
  const [ossLines, setOssLines] = useState<number[] | null>([]);
  const [lines, setLines] = useState<number[] | null>([]);

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

  const handleClose = async (inventory: Inventory) => {
    setInventoryBool(false);
    const newInventory = {
      ...inventory,
      files: [file],
    };
    await createInventory(newInventory);
  };

  const getFile = async () => {
    console.log('get fi');
    const { data } = await componentService.getFiles( { purl: currentMatch?.purl[0], version: currentMatch?.version });
    const currentFile = data.find(f => f.path == file);
    setFileStatus(mapFile(currentFile));
  };

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

  const onIdentifyPressed = async () => {
    setInventoryBool(true);
  };

  const onIgnorePressed = async () => {
    await ignoreFile(file);
    // getFile();
  };

  useEffect(() => {
    setLocalFileContent({ content: null, error: false });
    setRemoteFileContent({ content: null, error: false });

    if (file) {
      loadLocalFile(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentMatch) {
      getFile(); // TODO: on init cuando este el servicio
      loadRemoteFile(currentMatch.file_hash);
    }
  }, [currentMatch]);

  useEffect(() => {
    if (matchInfo) {
      setCurrentMatch(matchInfo[0]);
    } else {
      setCurrentMatch(null);
    }
  }, [matchInfo]);

  const onAction = (action: MATCH_INFO_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_INFO_CARD_ACTIONS.ACTION_ENTER:
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY:
        onIdentifyPressed();
        break;
      case MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE:
        onIgnorePressed();
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
                    {matchInfo.map((match, index) => (
                      <MatchInfoCard
                        key={index}
                        selected={currentMatch === match}
                        match={match}
                        status={fileStatus?.status}
                        onSelect={() => setCurrentMatch(matchInfo[index])}
                        onAction={onAction}
                      />
                    ))}
                  </div>
                </section>
                <div className="info-files">
                  <LabelCard
                    label="Source File"
                    subLabel={file}
                    status={null}
                  />
                  <LabelCard
                    label="Component File"
                    subLabel={currentMatch?.file}
                    status={null}
                  />
                </div>
              </header>
            </>
          ) : (
            <h1>No match found</h1>
          )}
        </header>

        <main className="editors app-content">
          <div className="editor">
            {currentMatch && localFileContent?.content ? (
              <>
                <SyntaxHighlighter
                  className="code-viewer"
                  wrapLongLines
                  style={nord}
                  language="javascript"
                  showLineNumbers
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (lines && lines.includes(lineNumber)) {
                      style.backgroundColor = '#ebe92252';
                    }
                    return { style };
                  }}
                >
                  {localFileContent?.error ? <p>File not found</p> : localFileContent?.content}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>

          <div className="editor">
            {currentMatch && remoteFileContent?.content ? (
              <>
                <SyntaxHighlighter
                  className="code-viewer"
                  wrapLongLines
                  style={nord}
                  language="javascript"
                  showLineNumbers
                  lineNumberContainerStyle={{ marginRigth: 20 }}
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (ossLines && ossLines.includes(lineNumber)) {
                      style.backgroundColor = '#ebe92252';
                    }
                    return { style };
                  }}
                >
                  {remoteFileContent?.error ? <p>File not found</p> : remoteFileContent?.content?.slice(0, 20000)}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>
        </main>
      </section>

      {currentMatch ? (
        <InventoryDialog
          open={inventoryBool}
          onCancel={() => setInventoryBool(false)}
          onClose={handleClose}
          component={{
            ...currentMatch,
            name: currentMatch.component
          }}
        />
      ) : null}
    </>
  );
};

export default Editor;
