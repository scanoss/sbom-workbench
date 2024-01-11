import React from 'react';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchComponent } from '@store/component-store/componentThunks';
import { Link } from '@mui/material';
import { Component } from 'main/services/ReportService';
import { setComponent } from '@store/component-store/componentSlice';
import { componentService } from '@api/services/component.service';

/* icons  */
import IconComponent from '../../../components/IconComponent/IconComponent';

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

export default function MatchesForLicense({ components, showCrypto, mode }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const onSelectComponent = async (e, component: Component) => {
    e.preventDefault();

    if (component.manifestFile) {
      onSelectFile(e, component.manifestFile);
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
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowHeight={42}
            headerHeight={40}
            rowCount={components.length}
            rowGetter={({ index }) => components[index]}
            headerClassName={classes.headerColumn}
            rowClassName={classes.row}
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
                    <Link
                      href="#"
                      underline="hover"
                      onClick={(e) => onSelectComponent(e, rowData)}
                    >
                      {rowData.name}
                    </Link>
                    <div>
                      <span className="small">{rowData.purl}@{rowData.version}</span>
                      {rowData.manifestFile && <span className="small"> - Found in <Link href="#" underline="hover" color="inherit" onClick={(e) => onSelectFile(e, rowData.manifestFile)}>{rowData.manifestFile}</Link></span>}
                    </div>
                  </div>
                </div>
              )}
            />

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

            {showCrypto && (
            <Column
              label={t('Table:Header:Cryptography')}
              dataKey="cryptography"
              width={200}
              flexGrow={1}
              flexShrink={0}
              cellRenderer={({ cellData }) => {
                const data = cellData
                  .map((algorithm, index) => (`${algorithm.algorithm} (${algorithm.strength})`))
                  .join(' - ');
                return <span title={data}>{data}</span>;
              }}
            />
            )}
          </Table>
        )}
      </AutoSizer>

      { components.length === 0 && <div className="mt-10 pt-2 text-center"><small>No data found</small></div> }
    </>
  );
}
