import Button from '@material-ui/core/Button';
import { group } from 'console';
import { setgroups } from 'process';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FileList } from './FileList';

export const IdentifiedList = ({ files, inventories, onAction }) => {
  const history = useHistory();

  const [groups, setGroups] = useState();

  const fetchGroups = () => {
    const group = {
      'ansible': files,
      'ansible-core': files,
    }
    setGroups(groups);
  }

  const groupBy = (arr, key) => {
    return arr.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  useEffect(fetchGroups, [files]);

  return (
    <>
        {/* { Object.keys(groups).map((key) => <FileList files={groups[key]} onAction={onAction} />) } */}
    </>
  );
};

export default IdentifiedList;
