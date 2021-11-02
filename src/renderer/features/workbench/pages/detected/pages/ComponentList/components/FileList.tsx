import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import usePagination from '../../../../../../../hooks/usePagination';
import MatchCard, { MATCH_CARD_ACTIONS } from '../../../../../components/MatchCard/MatchCard';

export interface FileListProps {
  files: any[];
  filter?: 'pending' | 'identified' | 'ignored';
  emptyMessage?: string;
  onAction: (path: any, action: MATCH_CARD_ACTIONS) => void;
}

export const FileList = ({ files, filter, emptyMessage, onAction }: FileListProps) => {
  const { limit, paginate } = usePagination(250);

  const filteredFiles = files.filter((file) => !filter || file.status === filter);

  return (
    <>
      <section className="file-list">
        {filteredFiles.length > 0 ? (
          filteredFiles.slice(0, limit).map((file) => (
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

      {filteredFiles.length > limit && (
        <Alert
          className="mt-3 mb-1"
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={paginate}>
              SHOW MORE
            </Button>
          }
        >
          <strong>
            Showing {limit} of {filteredFiles.length} files.
          </strong>
        </Alert>
      )}
    </>
  );
};

export default FileList;
