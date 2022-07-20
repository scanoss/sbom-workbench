import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const useStyles = makeStyles({
  table: {
    minWidth: 400,
  },
  tableCell: {
    padding: '0px 35px',
  },
});

const LicensesObligations = ({ data }) => {
  const classes = useStyles();
  const [licenseHash, setLicenseHash] = useState({});

  const init = () => {
    const aux = data.reduce((acc, curr) => {
      if (!acc[curr.label]) acc[curr.label] = curr;
      return acc;
    }, {});

    console.log(aux);
    console.log(data)

    setLicenseHash(aux);
  };

  useEffect(init, []);

  return (
    <>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className="" align="left">
                LICENSE
              </TableCell>
              <TableCell>COPYLEFT</TableCell>
              <TableCell>INCOMPATIBLE LICENSES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="selectable">
            {data?.map((license) => (
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
                    {license.incompatibles?.map((incompatibleLicense, index) =>
                      !licenseHash[incompatibleLicense] ? (
                        <div key={index} className="tinyPillLicenseContainer">
                          <span className="tinyPillLicenseLabel">{incompatibleLicense}</span>
                        </div>
                      ) : (
                        <div key={index} className="incompatible tinyPillLicenseContainer">
                          <span className="incompatible">{incompatibleLicense}</span>
                        </div>
                      )
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LicensesObligations;
