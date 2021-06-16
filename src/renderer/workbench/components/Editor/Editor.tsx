import { Card, CardContent } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

export const Editor = () => {
  const { file, matchInfo, remoteFileContent } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  return (
    <>

      <header>
        <Card>
          <CardContent>
            Test
          </CardContent>
        </Card>
      </header>

      <div>
        <strong>{file}</strong>
      </div>

      <section className="editors">
        <div className="editor">
          <pre>{remoteFileContent?.content}</pre>
        </div>

        <div className="editor">
          <pre>{remoteFileContent?.content}</pre>
        </div>
      </section>



    </>
  );
};

export default Editor;
