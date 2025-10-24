import React from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchComponent } from '@store/component-store/componentThunks';
import { Link, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

/* icons  */
import IconComponent from '../../../components/IconComponent/IconComponent';

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

export default function MatchesForLicense({ components , mode, loading  }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onSelectComponent = async (e, component: any) => {
    e.preventDefault();
    if (component.manifestFiles) {
      onSelectFile(e, component.manifestFiles[0]);
    } else {
      const pathname = mode === 'detected' ? '/workbench/detected/component' : '/workbench/identified/inventory';
      await dispatch(fetchComponent(component.purl));
      navigate({ pathname });
    }
  };

  const onSelectFile = async (e, path) => {
    e.preventDefault();
    navigate({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(path)}`,
    });
  };


  return (
    <>
      {!loading && components.length > 0 && (
        <AutoSizer>
          {({ height, width }) => (
            <StyledTable
              height={height}
              width={width}
              rowHeight={42}
              headerHeight={40}
              rowCount={components.length}
              rowGetter={({ index }) => components[index]}
            >
              <Column
                label={t('Table:Header:Component')}
                dataKey="component"
                width={500}
                flexGrow={2}
                flexShrink={0}
                cellRenderer={({ rowData }) => (
                  <div className="table-cell">
                    <IconComponent name={rowData.vendor} size={30} />
                    <div className="d-flex flex-column">
                      <Link href="#" underline="hover" onClick={(e) => onSelectComponent(e, rowData)}>
                        {rowData.name}
                      </Link>
                      <div>
                      <span className="small">
                        {rowData.purl}@{rowData.version}
                      </span>
                        {rowData.manifestFiles && (
                          <span className="small">
                          {' '}
                            - Found in{' '}
                            <Link href="#" underline="hover" color="inherit" onClick={(e) => onSelectFile(e, rowData.manifestFiles[0])}>
                            {rowData.manifestFiles.join(' - ')}
                          </Link>
                        </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />

              <Column label="Files" dataKey="fileCount" width={100} flexGrow={1} flexShrink={0} />

              <Column
                label={t('Table:Header:License')}
                dataKey="licenses"
                width={100}
                flexGrow={1}
                flexShrink={0}
                cellRenderer={({ cellData }) => {
                  const data = cellData.join(' - ');
                  return <span title={data}>{data}</span>;
                }}
              />
            </StyledTable>
          )}
        </AutoSizer>
      )}

      {loading && (

        <Box
             sx={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             flexFlow: 'column',
             gap: 0.5,
             height: '100%',
           }}
          >
          <CircularProgress size={20} />
          <div className="text-center">
            <small>{t('Common:LoadingComponents')}</small>
          </div>
        </Box>
        )}
      { (!loading && components.length === 0 ) && (
        <div className="mt-10 pt-2 text-center">
          <small>{t('Common:NoDataFound')}</small>
        </div>
      )}
    </>
  );
}
