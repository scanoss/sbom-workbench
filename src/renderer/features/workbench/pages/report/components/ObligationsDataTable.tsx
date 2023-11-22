import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  AutoSizer,
  Column,
  Table,
} from 'react-virtualized';
import { useTranslation } from 'react-i18next';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

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

    '& .table-cell': {
      cursor: 'pointer',
    },

    '& .file': {
      marginBottom: 2,
    },

    '&:hover .file': {
      textDecoration: 'underline',
    },
  },

});

const ObligationsDataTable = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [licenseHash, setLicenseHash] = useState({});

  const init = () => {
    const aux = data.reduce((acc, curr) => {
      if (!acc[curr.label]) acc[curr.label] = curr;
      return acc;
    }, {});

    setLicenseHash(aux);
  };

  useEffect(init, []);

  if (!data) {
    return <p className="text-center mb-0 mt-0">{t('LoadingObligationsInfo')}</p>;
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          className="tableRowLicense"
          height={height}
          width={width}
          rowHeight={38}
          headerHeight={40}
          rowCount={data.length}
          rowGetter={({ index }) => data[index]}
          headerClassName={classes.headerColumn}
          rowClassName={classes.row}
        >

          <Column label={t('Table:Header:License')} dataKey="label" width={200} flexGrow={1} flexShrink={0} />
          <Column
            label={t('Table:Header:Copyleft')}
            dataKey="copyleft"
            width={100}
            flexGrow={1}
            flexShrink={0}
            cellRenderer={({ cellData }) => (
              cellData === true ? (
                <CheckIcon style={{ fill: '#4ADE80' }} />
              ) : (
                <ClearIcon style={{ fill: '#F87171' }} />
              )
            )}
          />
          <Column
            label={t('Table:Header:IncompatibleLicenses')}
            dataKey="component"
            width={500}
            flexGrow={10}
            flexShrink={0}
            cellRenderer={({ rowData }) => (
              <div class="tableCellForLicensePill">
                <div className="container-licenses-pills">
                  {rowData.incompatibles?.map((incompatibleLicense, index) => (!licenseHash[incompatibleLicense] ? (
                    <div key={index} className="tinyPillLicenseContainer">
                      <span className="tinyPillLicenseLabel">{incompatibleLicense}</span>
                    </div>
                  ) : (
                    <div key={index} className="incompatible tinyPillLicenseContainer">
                      <span className="incompatible">{incompatibleLicense}</span>
                    </div>
                  )))}
                </div>
              </div>
            )}
          />
        </Table>
      )}
    </AutoSizer>
  );
};

export default ObligationsDataTable;
