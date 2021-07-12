import { Alert } from '@material-ui/lab';
import React from 'react';
import MatchCard from '../../../components/MatchCard/MatchCard';

const MAX_FILES = 500;

export interface FileListProps {
  files: any[];
  scan: any;
  filter?: 'pending' | 'identified' | 'ignored';
  onSelectFile: (path: string) => void;
}

export const FileList = ({ files, scan, filter, onSelectFile }: FileListProps) => {
  console.log(files);

  const f = files
    .map((file) => ({
      path: file,
      status: scan[file][0]?.status ? scan[file][0].status : 'pending',
    }))
    .filter((file) => !filter || file.status === filter);

  return (
    <>
      <section className="file-list">
        {f.length > 0
          ? f.slice(0, MAX_FILES).map((file) => (
              <article className="item" key={file.path} onClick={() => onSelectFile(file.path)}>
                <MatchCard label={file.path} status={file.status} />
              </article>
            ))
          : null}
      </section>

      {f.length > MAX_FILES && (
        <Alert className="my-5" severity="info">
          <strong>{f.length - MAX_FILES}</strong> files more...
        </Alert>
      )}
    </>
  );
};

export default FileList;
