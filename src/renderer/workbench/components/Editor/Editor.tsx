import { Card, CardContent, Chip } from '@material-ui/core';
import React, { useContext, useState, useEffect } from 'react';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Pill from '../Pill/Pill';
import Title from '../Title/Title';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent, localFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  return (
    <>
      <header className="match-info-header">
        <CardContent className="content">
          <div className="match-info-container">
            <div className="first-row-match">
              <span className="match-span">Match</span>
              <Pill state="Pending" />
            </div>
            <div className="second-row-match">
              <div>
                <Label label="COMPONENT" />
                {/* <Title title={matchInfo?.component} /> */}
              </div>
              <div>
                <Label label="VENDOR" />
                {/* <Title title={matchInfo?.vendor} /> */}
              </div>
              <div>
                <Label label="VERSION" />
                {/* <Title title={matchInfo?.version} /> */}
              </div>
              <div>
                <Label label="LICENSE" />
                {/* <Title title={matchInfo?.version} /> */}
              </div>
            </div>
          </div>
        </CardContent>
      </header>

      <div>
        <strong>{file}</strong>
      </div>

      {/* <section className="editors">
        <div className="editor">
          <pre>
            {localFileContent?.error ? (
              <p>File not found</p>
            ) : (
              localFileContent?.content
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
