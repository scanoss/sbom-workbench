import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import MatchCard from '../../components/MatchCard/MatchCard';
import { range } from '../../../../utils/utils';
import { workbenchController } from '../../../workbench-controller';
import { AppContext } from '../../../context/AppProvider';

export interface FileContent {
  content: string | null;
  error: boolean;
}

export const Editor = () => {
  const history = useHistory();

  const { file, matchInfo } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const { scanBasePath } = useContext<any>(AppContext);

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(
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
    console.log(matchInfo?.matched);
    if (!matchInfo) {
      return;
    }

    const linesOss =
      matchInfo?.id === 'file'
        ? null
        : range(
            parseInt(matchInfo?.oss_lines.split('-')[0]),
            parseInt(matchInfo?.oss_lines.split('-')[1])
          );

    setOssLines(linesOss);
    const lineasLocales =
      matchInfo?.id === 'file'
        ? null
        : range(
            parseInt(matchInfo?.lines.split('-')[0]),
            parseInt(matchInfo?.lines.split('-')[1])
          );
    setLines(lineasLocales);

    console.log(linesOss);
    console.log(lineasLocales);
  }, [matchInfo]);

  useEffect(() => {
    if (file && matchInfo) {
      loadLocalFile(file);
      loadRemoteFile(matchInfo.file_hash);
    } else {
      setRemoteFileContent({ content: null, error: false });
    }
  }, [file, matchInfo]);

  return (
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
                      <Title title={matchInfo?.component} />
                    </div>
                    <div>
                      <Label label="VENDOR" textColor="gray" />
                      <Title title={matchInfo?.vendor} />
                    </div>
                    <div>
                      <Label label="VERSION" textColor="gray" />
                      <Title title={matchInfo?.version} />
                    </div>
                    <div>
                      <Label label="LICENSE" textColor="gray" />
                      <Title
                        title={
                          matchInfo?.licenses[0]
                            ? matchInfo?.licenses[0].name
                            : '-'
                        }
                      />
                    </div>
                  </div>
                </div>
                <MatchCard
                  labelOfCard={file}
                  status={matchInfo?.status || 'pending'}
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
                wrapLongLines="true"
                style={atomOneDark}
                showLineNumbers
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
                wrapLongLines="true"
                style={atomOneDark}
                showLineNumbers
                lineProps={(lineNumber) => {
                  const style = { display: 'block' };
                  if (ossLines && ossLines.includes(lineNumber)) {
                    style.backgroundColor = '#ebe92247';
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

      {/* <section className="editors">
        <div className="editor">
          <pre>
            {remoteFileContent?.error ? (
              <p>File not found</p>
            ) : (
              remoteFileContent?.content
            )}
          </pre>
        </div>

        <div className="editor">
          <pre>
            {remoteFileContent?.error ? (
              <p>File not found</p>
            ) : (
              remoteFileContent?.content
            )}
          </pre>
        </div>
      </section> */}
    </section>
  );
};

export default Editor;
