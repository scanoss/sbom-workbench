import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AutoSizer, List } from 'react-virtualized';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Pre-compute row indices to avoid creating objects for each row
interface RowIndex {
  componentIndex: number;
  valueIndex: number;
}

export const ComponentCryptographyTable = ({data}) => {
  const { t } = useTranslation();

  // Only store indices, not full row objects
  const { rowIndices, totalRows } = useMemo(() => {
    if (!data?.components) return { rowIndices: [] as RowIndex[], totalRows: 0 };

    const indices: RowIndex[] = [];
    for (let componentIndex = 0; componentIndex < data.components.length; componentIndex++) {
      const component = data.components[componentIndex];
      for (let valueIndex = 0; valueIndex < component.values.length; valueIndex++) {
        indices.push({ componentIndex, valueIndex });
      }
    }
    return { rowIndices: indices, totalRows: indices.length };
  }, [data]);

  // Get row data on-demand instead of pre-computing all rows
  const getRowData = (index: number) => {
    if (index < 0 || index >= rowIndices.length) {
      return { name: '', type: '', algorithm: '' };
    }
    const { componentIndex, valueIndex } = rowIndices[index];
    const component = data?.components?.[componentIndex];
    if (!component) {
      return { name: '', type: '', algorithm: '' };
    }
    return {
      name: component.name ?? '',
      type: component.type ?? '',
      algorithm: component.values?.[valueIndex] ?? '',
    };
  };

  const rowRenderer = ({ key, index, style }) => {
    const row = getRowData(index);
    return (
      <div key={key} style={{...style, display: 'flex', userSelect: 'text'}}>
        <TableCell  style={{width: '70%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: 0, paddingRight: 80, userSelect: 'text'}}>
          {row.name}
        </TableCell>
        <TableCell style={{ width: '10%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding: 0, paddingRight: 20 }}>{row.type}</TableCell>
        <TableCell style={{ width: '20%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding: 0 }} className="detections">
          <span className="tag">{row.algorithm}</span>
        </TableCell>
      </div>
    );
  };

  return (
    <TableContainer
      style={{
        minHeight: '300px',
        overflow: 'auto',
        marginBottom: '50px',
      }}
      component={Paper}>
      <Table
        stickyHeader aria-label="cryptography table" size="small">
        <TableHead>
          <TableRow>
            <TableCell width="70%">{t('Table:Header:Component')}</TableCell>
            <TableCell width="10%" style={{ paddingLeft: 0, paddingRight: 0 }}>{t('Table:Header:Type')}</TableCell>
            <TableCell width="20%" style={{ paddingLeft: 0, paddingRight: 0 }}>{t('Table:Header:Detected')}</TableCell>
          </TableRow>
        </TableHead>
        {(!data || data?.components.length === 0) ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} align="center" className="pt-4 pb-4">
                {!data ? t('Loading') : t('NoDataFound')}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>
                <div style={{ height: 'calc(300px - 56px)' }}>
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        rowCount={totalRows}
                        rowHeight={30}
                        rowRenderer={rowRenderer}
                        width={width}
                        overscanRowCount={5}
                      />
                    )}
                  </AutoSizer>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>
    </TableContainer>
  )
}
