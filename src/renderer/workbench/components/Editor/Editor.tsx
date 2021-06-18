import { Card, CardContent, Chip } from '@material-ui/core';
import React, { useContext, useState, useEffect } from 'react';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Pill from '../Pill/Pill';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent, localFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  return (
    <>
      <header className="match-info-header">
        <Card className="container-info-card">
          <CardContent className="content">
            <div className="match-info-container">
              <div className="first-row-match">
                <span className="match-span">Match</span>
                <Pill state="Pending" />
              </div>
              <div className="second-row-match">
                <div>
                  <Label label="COMPONENT" />
                  <span className="title-component-vendor">
                    {/* {matchInfo?.component} */}
                  </span>
                </div>
                <div>
                  <Label label="VENDOR" />
                  <span className="title-component-vendor">
                    {/* {matchInfo?.vendor} */}
                  </span>
                </div>
                <div>
                  <Label label="VENDOR" />
                  {/* <span className="title-component-vendor">{matchInfo?.version}</span> */}
                </div>
              </div>
            </div>
            <div className="usage-container">
              <div>
                <Label label="USAGE" />
                <span>Separated work</span>
              </div>
              <div>
                <Label label="USAGE" />
                <span>Sepa</span>
              </div>
              <div>
                <Label label="USAGE" />
                <span>Sepa</span>
              </div>
              <div>
                <Label label="USAGE" />
                <span>Sepa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <div>
        <strong>{file}</strong>
      </div>

      <section className="editors">
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
      </section>
    </>
  );
};

export default Editor;
