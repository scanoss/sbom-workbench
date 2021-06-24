import { Card, CardContent, Chip } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent, localFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  return (
    <>
      <header className="match-info-header">
        <Link to="/workbench/component">
          <p>BACK</p>
        </Link>

        <Card>
          <CardContent className="content">
            <div>
              {matchInfo ? (
                <div>
                  <h3>Match</h3>
                  <ul>
                    <li>
                      Component: <strong>{matchInfo?.component}</strong>
                    </li>
                    <li>
                      Vendor: <strong>{matchInfo?.vendor}</strong>
                    </li>
                    <li>
                      Purl: <strong>{matchInfo?.purl?.join(' - ')}</strong>
                    </li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3>No match info</h3>
                </div>
              )}
            </div>
            <div> </div>
            <div> </div>
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
