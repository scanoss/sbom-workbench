import Button from '@material-ui/core/Button';
import { group } from 'console';
import { setgroups } from 'process';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FileList } from './FileList';

export const IdentifiedList = ({ files, inventories, onAction }) => {
  const history = useHistory();

  const [groups, setGroups] = useState({});

  const fetchGroups = () => {
    const grupedFiles = files.reduce((acc, file) => {
      if (!acc.hasOwnProperty(file.inventory.component.name)) acc[file.inventory.component.name] = [];
      acc[file.inventory.component.name].push(file);
      return acc;
    }, {});

    console.log(grupedFiles);

    setGroups(grupedFiles);
  };

  useEffect(fetchGroups, [files]);

  return (
    <>
      {Object.keys(groups).map((key) => (
        <div>
          <h3> {key} </h3>
          <FileList files={groups[key]} onAction={onAction} />
        </div>
      ))}
    </>
  );
};

export default IdentifiedList;
