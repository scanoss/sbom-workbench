import React, { useEffect, useRef } from 'react';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import { useTranslation } from 'react-i18next';
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
  }
}));

const CryptographyDataTable = ({ data }) => {
  const { t } = useTranslation();

  const items = useRef<any[]>([]);

  const init = () => {
    items.current = data;
  };

  useEffect(init, []);

  // empty
  if (!data || data.length === 0) {
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
          rowHeight={28}
          headerHeight={40}
          rowCount={items.current.length}
          rowGetter={({ index }) => items.current[index]}
          index={(index) => `${items.current[index].purl}@${items.current[index].version}`}
        >
          <Column label={t('Table:Header:PURL')} dataKey="purl" width={200} flexGrow={1} flexShrink={0} />
          <Column label={t('Table:Header:Version')} dataKey="version" width={100} flexGrow={1} flexShrink={0} />
          <Column
            label={t('Table:Header:Algorithms')}
            dataKey="algorithms"
            width={500}
            flexGrow={10}
            flexShrink={0}
            cellRenderer={({ cellData }) => {
              const data = cellData
                .map((algorithm) => (
                  <span>
                    {algorithm.algorithm} ({algorithm.strength})
                  </span>
                )).reduce((acc, curr) => [acc, ' - ', curr]);

              return <span title={data}>data</span>;
            }}
          />
        </StyledTable>
      )}
    </AutoSizer>
  );
};

export default CryptographyDataTable;
