import Button from '@material-ui/core/Button';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FileList } from './FileList';

const style = {
  actions: {
    marginBottom: 8,
  },
};
export const IdentifiedList = ({ files, onAction }) => {
  const history = useHistory();

  return (
    <>
      {files.length > 0 && (
        <>
          <div style={style.actions} className="d-flex space-between align-center">
            <span></span>
            <Button onClick={(event) => history.push('/workbench/inventory')}>View groups</Button>
          </div>

          <FileList files={files} onAction={onAction} />
        </>
      )}
    </>
  );
};

export default IdentifiedList;
