import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import { Alert } from '@mui/material';

const LicensesObligations = ({ data }) => {
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

  return (
    <TableContainer>
      <Table
        sx={{
          minWidth: 400,
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: 'transparent !important',
            padding: 8,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="left">{t('Table:Header:License')}</TableCell>
            <TableCell>{t('Table:Header:Copyleft')}</TableCell>
            <TableCell>{t('Table:Header:IncompatibleLicenses')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="selectable">
          {data?.map((license) => (
            license.error
              ? (
                <TableRow className="tableRowLicense" key={license.label}>
                  <TableCell component="th" scope="row" colSpan={3}>
                    <Alert icon="" severity="error">Error fetching data for {license.label}.</Alert>
                  </TableCell>
                </TableRow>
              )
              : (
                <TableRow className="tableRowLicense" key={license.label}>
                  <TableCell component="th" scope="row">
                    {license?.label}
                  </TableCell>
                  <TableCell>
                    {license.copyleft === true ? (
                      <CheckIcon style={{ fill: '#4ADE80' }} />
                    ) : (
                      <ClearIcon style={{ fill: '#F87171' }} />
                    )}
                  </TableCell>
                  <TableCell className="tableCellForLicensePill">
                    <div className="container-licenses-pills">
                      {license.incompatibles?.map((incompatibleLicense, index) => (!licenseHash[incompatibleLicense] ? (
                        <div key={index} className="tinyPillLicenseContainer">
                          <span className="tinyPillLicenseLabel">{incompatibleLicense}</span>
                        </div>
                      ) : (
                        <div key={index} className="incompatible tinyPillLicenseContainer">
                          <span className="incompatible">{incompatibleLicense}</span>
                        </div>
                      )))}
                    </div>
                  </TableCell>
                </TableRow>
              )
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LicensesObligations;
