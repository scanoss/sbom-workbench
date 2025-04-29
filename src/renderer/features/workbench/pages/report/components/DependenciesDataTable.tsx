import React, { useEffect, useRef } from 'react';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';

const StyledTable = styled(Table)(({ theme }) => ({
  '& .ReactVirtualized__Table__headerColumn': {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    color: 'rgba(0, 0, 0, 0.87)',
    textTransform: 'capitalize',
    height: '100%',
    alignItems: 'center',
    display: 'flex',
  },
  '& .ReactVirtualized__Table__row': {
    fontWeight: 400,
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    color: 'rgba(0, 0, 0, 0.87)',

    '& .table-cell': {
      cursor: 'pointer',
    },

    '& .file': {
      marginBottom: 2,
    },

    '&:hover .file': {
      textDecoration: 'underline',
    },
  }
}));

const DependenciesDataTable = ({ data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = useRef<any[]>([]);

  const init = () => {
    items.current = data.files;
  };

  const onClickHandler = (path) => {
    navigate({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(path)}`,
    });
  };

  useEffect(init, []);

  // empty
  if (!data.files || data.files.length === 0) {
    return (
      <div className="empty-table">
        <p className="text-center mt-5 mb-3">{t('NoDataFound')}</p>
      </div>
    );
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <StyledTable
          height={height}
          width={width}
          rowHeight={38}
          headerHeight={40}
          rowCount={items.current.length}
          rowGetter={({ index }) => items.current[index]}
        >
          <Column
            label={t('Table:Header:File')}
            dataKey="component"
            width={500}
            flexGrow={10}
            flexShrink={0}
            cellRenderer={({ rowData }) => (
              <div className="table-cell" onClick={(e) => onClickHandler(rowData.path)}>
                <i className="fa fa-dependency-file mr-2" />
                <div className="d-flex flex-column">
                  <span className="file">{rowData.path}</span>
                  <span className="label small">{rowData.total} dependencies found</span>
                </div>
              </div>
            )}
          />
        </StyledTable>
      )}
    </AutoSizer>
  );
};

export default DependenciesDataTable;
