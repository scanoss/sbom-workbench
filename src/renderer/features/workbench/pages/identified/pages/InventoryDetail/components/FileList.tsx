import React from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import MatchCard, { MATCH_CARD_ACTIONS } from '../../../../../components/MatchCard/MatchCard';

const MAX_FILES = 250;

export interface FileListProps {
  files: any[];
  filter?: 'pending' | 'identified' | 'ignored';
  onAction: (id: any, action: MATCH_CARD_ACTIONS) => void;
}

export const FileList = ({ files, filter, onAction }: FileListProps) => {
  const filteredFiles = files.filter((file) => !filter || filter === file.status);

  return (
    <>
      <section className="file-list">
        {filteredFiles.length > 0
          ? filteredFiles.slice(0, MAX_FILES).map((file, index) => (
            <article className="item" key={index}>
              <MatchCard
                onAction={(action) => onAction(file, action)}
                label={file.path}
                status={file.status}
                type={file.type}
                version={file.version}
              />
            </article>
          ))
          : null}
      </section>

      {filteredFiles.length > MAX_FILES && (
        <Alert className="my-5" severity="info">
          <Trans i18nKey="NFilesMore" values={{ count: filteredFiles.length - MAX_FILES }} components={{ strong: <strong /> }} />
        </Alert>
      )}
    </>
  );
};

FileList.defaultProps = {
  filter: null,
};

export default FileList;
