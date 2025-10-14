import { Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AutoSizer, List } from 'react-virtualized';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cryptographyService } from '@api/services/cryptography.service';

export const LocalCryptographyTable = ({data}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rows = useMemo(() => {
    if (!data || !data.files) return [];
    return data.files.flatMap((item, itemIndex) =>
      item.values.map((algorithm, algIndex) => ({
        key: `${itemIndex}-${algIndex}`,
        fileName: item.name,
        type: item.type,
        algorithm,
      }))
    );
  }, [data]);

  const onSelectFile = async (e, path:string, algorithm:string) => {
    e.preventDefault();
    const keywords = await cryptographyService.getKeyWords(algorithm);
    navigate({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(path)}&crypto=true&highlight=${encodeURIComponent(keywords.join(','))}}`,
    });
  };

  const rowRenderer = ({ key, index, style }) => {
    const row = rows[index];
    return (
      <div key={key} style={{...style, display: 'flex'}}>
        <TableCell style={{width: '70%', display: 'flex',alignItems: 'center', justifyContent: 'flex-start', padding:0 , paddingRight:80}}>
          <Link
            href="#"
            underline="hover"
            color="inherit"
            onClick={(e) => onSelectFile(e, row.fileName, row.algorithm)}
          >
            {row.fileName}
          </Link>
        </TableCell>
        <TableCell style={{ width: '10%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding:0, paddingRight:20  }}>{row.type}</TableCell>
        <TableCell style={{ width: '20%', display: 'flex', alignItems: 'center', justifyContent:'flex-start', padding: 0  }}>
          <span className="tag">{row.algorithm}</span>
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
                        rowCount={rows.length}
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
