import { Card, CardContent, Chip } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  return (
    <>
      <header className="match-info-header">
        <Card>
          <CardContent className="content">
            <div>
              Match <Chip label="Pending" variant="outlined" />
              {matchInfo?.component} - {matchInfo?.vendor}
            </div>
            <div>B</div>
            <div>C</div>
          </CardContent>
        </Card>
      </header>

      <div>
        <strong>{file}</strong>
      </div>

      <section className="editors">
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
      </section>
    </>
  );
};

export default Editor;
