import { Card, CardContent, Chip } from '@material-ui/core';
import React, { useContext, useState, useEffect } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Title from '../Title/Title';
import MatchCard from '../MatchCard/MatchCard';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent, localFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const matchCode = remoteFileContent?.content?.toString();

  return (
    <>
      {matchInfo ? (
        <>
          <div className="match-title">
            <ArrowBackIcon className="arrow-icon" />
            <span className="match-span">Match</span>
          </div>
          <header className="match-info-header">
            <CardContent className="content">
              <div className="match-info-container">
                <div className="second-row-match">
                  <div>
                    <Label label="COMPONENT" textColor="gray" />
                    {/* <Title title={matchInfo?.component} /> */}
                  </div>
                  <div>
                    <Label label="VENDOR" textColor="gray" />
                    {/* <Title title={matchInfo?.vendor} /> */}
                  </div>
                  <div>
                    <Label label="VERSION" textColor="gray" />
                    {/* <Title title={matchInfo?.version} /> */}
                  </div>
                  <div>
                    <Label label="LICENSE" textColor="gray" />
                    {/* <Title
                      title={
                        matchInfo?.licenses[0]
                          ? matchInfo?.licenses[0].name
                          : '-'
                      }
                    /> */}
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

      <section className="editors">
        <div className="editor">
          {remoteFileContent?.content ? (
            <>
              <p>Source File</p>
              <SyntaxHighlighter language="javascript" style={atomOneDark}>
                {remoteFileContent?.error ? (
                  <p>File not found</p>
                ) : (
                  remoteFileContent?.content?.toString()
                )}
              </SyntaxHighlighter>
            </>
          ) : null}
        </div>

        <div className="editor">
          {remoteFileContent?.content ? (
            <>
              <p>Component File</p>
              <SyntaxHighlighter language="javascript" style={atomOneDark}>
                {remoteFileContent?.error ? (
                  <p>File not found</p>
                ) : (
                  remoteFileContent?.content?.toString()
                )}
              </SyntaxHighlighter>
            </>
          ) : null}
        </div>
      </section>

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
    </>
  );
};

export default Editor;
