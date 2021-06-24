import { CardContent } from '@material-ui/core';
import React, { useContext } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import MatchCard from '../../components/MatchCard/MatchCard';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';

export const Editor = () => {
  const history = useHistory();

  const { file, matchInfo, remoteFileContent, localFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

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
              <CardContent className="content">
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
                <MatchCard labelOfCard={file} status="pending" />
              </CardContent>
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
