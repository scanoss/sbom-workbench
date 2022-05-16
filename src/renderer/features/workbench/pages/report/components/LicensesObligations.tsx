import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

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
          <TableBody>
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
