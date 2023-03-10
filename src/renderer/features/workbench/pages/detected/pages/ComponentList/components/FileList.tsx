import React from 'react';
import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import usePagination from '@hooks/usePagination';
import MatchCard, { MATCH_CARD_ACTIONS } from '../../../../../components/MatchCard/MatchCard';

export interface FileListProps {
  files: any[];
  filter?: 'pending' | 'identified' | 'ignored';
  emptyMessage?: string;
  onAction: (path: any, action: MATCH_CARD_ACTIONS) => void;
}

export const FileList = ({ files, filter, emptyMessage, onAction }: FileListProps) => {
  const { t } = useTranslation();
  const { limit, paginate } = usePagination(250);

  const filteredFiles = files?.filter((file) => !filter || file.status === filter);

  // loader
  if (!files)
    return <p>Loading files...</p>;

  // empty
  if (filteredFiles?.length === 0)
    return  <p>{emptyMessage || 'No files found'}</p>;

  return (
    <>
      <section className="file-list">
        {filteredFiles.slice(0, limit).map((file) => (
          <article className="item" key={file.id}>
            <MatchCard
              onAction={(action) => onAction(file, action)}
              label={file.path}
              status={file.status}
              type={file.type}
            />
          </article>
        ))}
    </section>

      {filteredFiles.length > limit && (
        <Alert
          className="mt-3 mb-1"
          severity="info"
          action={
            <Button className="text-uppercase" color="inherit" size="small" onClick={paginate}>
              {t('Button:ShowMore')}
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

FileList.defaultProps = { emptyMessage: null, filter: null }

export default FileList;
