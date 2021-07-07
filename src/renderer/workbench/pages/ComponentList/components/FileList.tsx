import MatchCard from '../../../components/MatchCard/MatchCard';
import React from 'react';

export interface FileListProps {
  component: any;
  scan: any;
  filter?: 'pending' | 'identified' | 'ignored';
  onSelectFile: (path: string) => void;
}

export const FileList = ({component, scan, filter, onSelectFile}: FileListProps) => {
  const files = component.files
    .map((file) => ({
      path: file,
      status: scan[file][0]?.status
        ? scan[file][0].status
        : 'pending'
    }))
    .filter((file) => !filter || file.status == filter);

  return (
    <section className="file-list">
    { files.length > 0
      ? files.map((file) => (
        <article
          className="item"
          key={file.path}
          onClick={() => onSelectFile(file.path)}
        >
          <MatchCard
            label={file.path}
            status={file.status}
          />
        </article>
      ))
      : null}
  </section>
  );
}

export default FileList;
