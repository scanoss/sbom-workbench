import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectComponentState } from '@store/component-store/componentSlice';
import { FileList } from './FileList';

export const IdentifiedList = ({ files, emptyMessage, onAction }) => {
  const { component } = useSelector(selectComponentState);
  const [groups, setGroups] = useState({});

  const fetchGroups = () => {
    const grupedFiles = files.reduce((acc, file) => {
      const key = file.component?.name;
      // eslint-disable-next-line no-prototype-builtins
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
        <section key={key} className={`group ${key !== component.name ? 'current' : ''}`}>
          {key !== component.name && (
            <>
              <h3>
                Identified as <span className="component">{key}</span>
              </h3>
            </>
          )}
          <FileList files={groups[key]} onAction={onAction} />
        </section>
      ))}

      {Object.keys(groups).length === 0 && <p>{emptyMessage}</p>}
    </div>
  );
};

export default IdentifiedList;
