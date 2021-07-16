import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import { DialogContext } from '../../../context/DialogProvider';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import MatchCard from '../../components/MatchCard/MatchCard';
import { range } from '../../../../utils/utils';
import { workbenchController } from '../../../workbench-controller';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../../../api/types';
import LabelCard from '../../components/LabelCard/LabelCard';
import MatchInfoCard from '../../components/MatchInfoCard/MatchInfoCard';

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  console.log('render');

  const { state, dispatch, createInventory } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { setInventoryBool, inventoryBool } = useContext<any>(DialogContext);

  const { file, matchInfo } = state;

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(null);
  const [remoteFileContent, setRemoteFileContent] = useState<FileContent | null>(null);
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

  useEffect(() => {
    setLocalFileContent({ content: null, error: false });
    setRemoteFileContent({ content: null, error: false });

    if (file) {
      loadLocalFile(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentMatch) {
      loadRemoteFile(currentMatch.file_hash);
    }
  }, [currentMatch]);

  // TODO: render all matches
  useEffect(() => {
    if (matchInfo) {
      setCurrentMatch(matchInfo[0]);
    } else {
      setCurrentMatch(null);
    }
  }, [matchInfo]);

  return (
    <>
      <section className="app-page">
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
                      <MatchInfoCard match={match} onClickCheck={() => setInventoryBool(true)} key={index} />
                    ))}
                  </div>
                  <div className="match-info-identified-container">
                    {/* {matchInfo.map((match, index) => (
                      <MatchInfoCard match={match} onClickCheck={() => setInventoryBool(true)} key={index} />
                    ))} */}
                  </div>
                </section>
              </header>
            </>
          ) : (
            <h1>No info</h1>
          )}
        </header>

        <main className="editors app-content">
          <div className="editor">
            {currentMatch && remoteFileContent?.content ? (
              <>
                <LabelCard
                  label="Source File"
                  subLabel={file}
                  onClickCheck={() => setInventoryBool(true)}
                  status={null}
                />
                <SyntaxHighlighter
                  className="code-viewer"
                  wrapLongLines
                  style={nord}
                  showLineNumbers
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (lines && lines.includes(lineNumber)) {
                      style.backgroundColor = '#ebe92252';
                    }
                    return { style };
                  }}
                >
                  {remoteFileContent?.error ? <p>File not found</p> : remoteFileContent?.content}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>

          <div className="editor">
            {currentMatch && remoteFileContent?.content ? (
              <>
                <LabelCard
                  label="Component File"
                  subLabel={file}
                  onClickCheck={() => setInventoryBool(true)}
                  status={null}
                />
                <SyntaxHighlighter
                  className="code-viewer"
                  wrapLongLines
                  style={nord}
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
          component={{ ...currentMatch, name: currentMatch.component }}
        />
      ) : null}
    </>
  );
};

export default Editor;
