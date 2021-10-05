import { Alert } from '@material-ui/lab';
import React from 'react';
import MatchCard, { MATCH_CARD_ACTIONS } from '../../../../../components/MatchCard/MatchCard';

const MAX_FILES = 250;

export interface FileListProps {
  files: any[];
  filter?: 'pending' | 'identified' | 'ignored';
  emptyMessage?: string;
  onAction: (path: any, action: MATCH_CARD_ACTIONS) => void;
}

export const FileList = ({ files, filter, emptyMessage, onAction }: FileListProps) => {
  const filteredFiles = files.filter((file) => !filter || file.status === filter);

  return (
    <>
      <section className="file-list">
        {filteredFiles.length > 0 ? (
          filteredFiles.slice(0, MAX_FILES).map((file) => (
            <article className="item" key={file.id}>
              <MatchCard
                onAction={(action) => onAction(file, action)}
                label={file.path}
                status={file.status}
                type={file.type}
              />
            </article>
          ))
        ) : (
          <p>{emptyMessage || 'No files found'}</p>
        )}
      </section>

      {filteredFiles.length > MAX_FILES && (
        <Alert className="mt-3 mb-3" severity="info">
          <strong>{filteredFiles.length - MAX_FILES}</strong> files more...
        </Alert>
      )}
    </>
  );
};

export default FileList;
