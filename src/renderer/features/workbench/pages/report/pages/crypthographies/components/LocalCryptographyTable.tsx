import { Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AutoSizer, List } from 'react-virtualized';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Pre-compute row indices to avoid creating objects for each row
interface RowIndex {
  fileIndex: number;
  valueIndex: number;
}

export const LocalCryptographyTable = ({data}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Only store indices, not full row objects
  const { rowIndices, totalRows } = useMemo(() => {
    if (!data?.files) return { rowIndices: [] as RowIndex[], totalRows: 0 };

    const indices: RowIndex[] = [];
    for (let fileIndex = 0; fileIndex < data.files.length; fileIndex++) {
      const file = data.files[fileIndex];
      for (let valueIndex = 0; valueIndex < file.values.length; valueIndex++) {
        indices.push({ fileIndex, valueIndex });
      }
    }
    return { rowIndices: indices, totalRows: indices.length };
  }, [data]);

  // Get row data on-demand instead of pre-computing all rows
  const getRowData = (index: number) => {
    if (index < 0 || index >= rowIndices.length) {
      return { fileName: '', type: '', algorithm: '' };
    }
    const { fileIndex, valueIndex } = rowIndices[index];
    const file = data?.files?.[fileIndex];
    if (!file) {
      return { fileName: '', type: '', algorithm: '' };
    }
    return {
      fileName: file.name ?? '',
      type: file.type ?? '',
      algorithm: file.values?.[valueIndex] ?? '',
    };
  };

  const onSelectFile = async (e, filePath:string) => {
    e.preventDefault();
    const detectedKeys = data.files
      .filter(f => f.name === filePath)
      .flatMap(f => f.values);
    navigate({
      pathname: '/workbench/crypto-search/file',
      search: `?path=${encodeURIComponent(filePath)}&crypto=${encodeURIComponent(detectedKeys.join(','))}&force-search=true&search-type=file`,
    });
  };

  const onSelectAlgorithm = async (e, path:string, key:number) => {
    e.preventDefault();
    navigate({
      pathname: '/workbench/crypto-search/file',
      search: `?path=${encodeURIComponent(path)}&crypto=${encodeURIComponent(key)}&force-search=true&search-type=algorithm`,
    });
  };

  const rowRenderer = ({ key, index, style }) => {
    const row = getRowData(index);
    return (
      <div key={key} style={{...style, display: 'flex', userSelect: 'text'}}>
        <TableCell style={{width: '70%', display: 'flex',alignItems: 'center', justifyContent: 'flex-start', padding:0 , paddingRight:80, userSelect: 'text'}}>
          <Link
            href="#"
            underline="hover"
            color="inherit"
            onClick={(e) => onSelectFile(e, row.fileName)}
          >
            {row.fileName}
          </Link>
        </TableCell>
        <TableCell style={{ width: '10%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding:0, paddingRight:20  }}>{row.type}</TableCell>
        <TableCell style={{ width: '20%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding: 0  }}>
          <Link
            href="#"
            underline="hover"
            color="inherit"
            onClick={(e) => onSelectAlgorithm(e, row.fileName, row.algorithm)}
          >
            {row.algorithm}
          </Link>
        </TableCell>
      </div>
    );
  };

  return (
    <TableContainer
      style={{
        minHeight: '300px',  // Set your desired height here
        overflow: 'auto',
        marginBottom: '50px',
      }}
      component={Paper}>
      <Table stickyHeader aria-label="cryptography table" size="small">
        <TableHead>
          <TableRow>
            <TableCell width="70%">{t('Table:Header:File')}</TableCell>
            <TableCell width="10%" style={{ paddingLeft: 0 , paddingRight:0}}>{t('Table:Header:Type')}</TableCell>
            <TableCell width="20%" style={{ paddingLeft: 0, paddingRight:0}}>{t('Table:Header:Detected')}</TableCell>
          </TableRow>
        </TableHead>
        {(!data || data.files.length === 0) ? (
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
                <div style={{ height: 'calc(300px - 56px)' }}> {/* Adjust based on your header height */}
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        rowCount={totalRows}
                        rowHeight={30} // Adjust based on your row height
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
