import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import { DialogContext } from '../../DialogProvider';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import MatchCard from '../../components/MatchCard/MatchCard';
import { range } from '../../../../utils/utils';
import { workbenchController } from '../../../workbench-controller';
import { AppContext } from '../../../context/AppProvider';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../../../api/types';

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  const { file, matchInfo, component, createInventory } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const { setInventoryBool, inventoryBool } = useContext<any>(DialogContext);
  const { scanBasePath } = useContext<any>(AppContext);

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(
    null
  );

  const [currentMatch, setCurrentMatch] = useState<Record<string, any> | null>(
    null
  );

  const [remoteFileContent, setRemoteFileContent] =
    useState<FileContent | null>(null);

  const [ossLines, setOssLines] = useState<number[] | null>([]);
  const [lines, setLines] = useState<number[] | null>([]);

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false });
      const content = await workbenchController.fetchLocalFile(
        scanBasePath + path
      );
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

  useEffect(() => {
    if (!currentMatch) {
      return;
    }

    const linesOss =
      currentMatch.id === 'file'
        ? null
        : range(
            parseInt(currentMatch.oss_lines.split('-')[0]),
            parseInt(currentMatch.oss_lines.split('-')[1])
          );

    setOssLines(linesOss);

    const lineasLocales =
      currentMatch.id === 'file'
        ? null
        : range(
            parseInt(currentMatch.lines.split('-')[0]),
            parseInt(currentMatch.lines.split('-')[1])
          );
    setLines(lineasLocales);
  }, [matchInfo]);

  const handleClose = async (inventory: Inventory) => {
    setInventoryBool(false);
    console.log(file);
    const newInventory = {
      ...inventory,
      files: [file],
    };
    await createInventory(newInventory);
  };

  useEffect(() => {
    if (file && currentMatch) {
      loadLocalFile(file);
      loadRemoteFile(currentMatch.file_hash);
    } else {
      setRemoteFileContent({ content: null, error: false });
    }
  }, [file, currentMatch]);

  useEffect(() => {
    if (matchInfo) setCurrentMatch(matchInfo[0]); // TODO: render all matches
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
                  <div className="match-info-container">
                    <div className="second-row-match">
                      <div>
                        <Label label="COMPONENT" textColor="gray" />
                        <Title title={currentMatch?.component} />
                      </div>
                      <div>
                        <Label label="VENDOR" textColor="gray" />
                        <Title title={currentMatch?.vendor} />
                      </div>
                      <div>
                        <Label label="VERSION" textColor="gray" />
                        <Title title={currentMatch?.version} />
                      </div>
                      <div>
                        <Label label="LICENSE" textColor="gray" />
                        <Title
                          title={
                            currentMatch?.licenses[0]
                              ? currentMatch?.licenses[0].name
                              : '-'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <MatchCard
                    label={file}
                    onClickCheck={() => setInventoryBool(true)}
                    status={currentMatch?.status || 'pending'}
                  />
                </section>
              </header>
            </>
          ) : (
            <h1>No info</h1>
          )}
        </header>

        <main className="editors app-content">
          <div className="editor">
            {localFileContent?.content ? (
              <>
                <p>Source File</p>
                <SyntaxHighlighter
                  className="code-viewer"
                  language="javascript"
                  wrapLongLines
                  style={nord}
                  showLineNumbers
                  lineNumberStyle={{ color: '#ddd', fontSize: 20 }}
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (lines && lines.includes(lineNumber)) {
                      style.backgroundColor = '#ebe92252';
                    }
                    return { style };
                  }}
                >
                  {localFileContent?.error ? (
                    <p>File not found</p>
                  ) : (
                    localFileContent?.content?.toString()
                  )}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>

          <div className="editor">
            {remoteFileContent?.content ? (
              <>
                <p>Component File</p>
                <SyntaxHighlighter
                  className="code-viewer"
                  language="javascript"
                  wrapLongLines
                  style={nord}
                  showLineNumbers
                  lineNumberStyle={{
                    color: '#ddd',
                    fontSize: 15,
                    minWidth: 1.25,
                  }}
                  lineNumberContainerStyle={{ marginRigth: 20 }}
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (ossLines && ossLines.includes(lineNumber)) {
                      style.backgroundColor = '#ebe92252';
                    }
                    return { style };
                  }}
                >
                  {remoteFileContent?.error ? (
                    <p>File not found</p>
                  ) : (
                    remoteFileContent?.content?.toString()
                  )}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>
        </main>
      </section>

      <InventoryDialog
        open={inventoryBool}
        onCancel={() => setInventoryBool(false)}
        onClose={handleClose}
        component={component}
      />
    </>
  );
};

export default Editor;
