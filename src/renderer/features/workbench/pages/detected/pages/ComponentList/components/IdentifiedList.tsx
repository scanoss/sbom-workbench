import Button from '@material-ui/core/Button';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { WorkbenchContext, IWorkbenchContext } from '../../../../../store';
import { FileList } from './FileList';

export const IdentifiedList = ({ files, inventories, onAction }) => {
  const history = useHistory();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const [groups, setGroups] = useState({});

  const fetchGroups = () => {
    const grupedFiles = files.reduce((acc, file) => {
      const key = file.inventory.component.name;
      if (!acc.hasOwnProperty(key)) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});

    setGroups(grupedFiles);
  };

  useEffect(fetchGroups, [files]);

  return (
    <div className="file-group-container">
      {Object.keys(groups).map((key) => (
        <section key={key} className={`group ${key !== state.component.name ? 'current' : ''}`}>
          {key !== state.component.name && (
            <>
              <h3>
                Identified as <span className="component">{key}</span>
              </h3>
            </>
          )}
          <FileList files={groups[key]} onAction={onAction} />
        </section>
      ))}

      {Object.keys(groups).length === 0 && <p>No identified files</p>}
    </div>
  );
};

export default IdentifiedList;
