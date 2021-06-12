import React, { useContext, useState } from 'react';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

export const Editor = () => {
  const { file, matchInfo } = useContext(WorkbenchContext) as IWorkbenchContext;

  return (
    <>
      <div>
        <strong>{file}</strong>
      </div>
      <div>{JSON.stringify(matchInfo)}</div>
    </>
  );
};

export default Editor;
