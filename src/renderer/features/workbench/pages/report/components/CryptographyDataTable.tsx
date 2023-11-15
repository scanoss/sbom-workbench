import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  headerColumn: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    color: 'rgba(0, 0, 0, 0.87)',
    textTransform: 'capitalize',
    height: '100%',
    alignItems: 'center',
    display: 'flex',
  },

  row: {
    fontWeight: 400,
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    color: 'rgba(0, 0, 0, 0.87)',
  },

});

const CryptographyDataTable = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const items = useRef<any[]>([]);

  const init = () => {
    items.current = data;
  };

  useEffect(init, []);

  // empty
  if (!data || data.length === 0) {
    return <p className="text-center mt-5 mb-3">{t('NoData')}</p>;
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          height={height}
          width={width}
          rowHeight={28}
          headerHeight={40}
          rowCount={items.current.length}
          rowGetter={({ index }) => items.current[index]}
          headerClassName={classes.headerColumn}
          rowClassName={classes.row}
        >
          <Column label={t('Table:Header:PURL')} dataKey="purl" width={200} flexGrow={1} flexShrink={0} />
          <Column label={t('Table:Header:Version')} dataKey="version" width={100} flexGrow={1} flexShrink={0} />
          <Column
            label={t('Table:Header:Algorithms')}
            dataKey="algorithms"
            width={500}
            flexGrow={10}
            flexShrink={0}
            cellRenderer={({ cellData }) => cellData.map((algorithm) => (
              <span>
                {algorithm.algorithm} ({algorithm.strength}) - {' '}
              </span>
            ))}
          />
        </Table>
      )}
    </AutoSizer>
  );
};

export default CryptographyDataTable;
