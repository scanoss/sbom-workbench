import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
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

export default function MatchesForLicense({ data }) {
  const classes = useStyles();

  console.log(data);

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
            {data?.map((row) => (
              <TableRow className="tableRowLicense" key={row.label}>
                <TableCell component="th" scope="row">
                  {row?.label}
                </TableCell>
                <TableCell>{row?.copyleft === true ? <CheckIcon style={{ fill: '#4ADE80' }} /> : <ClearIcon style={{ fill: '#F87171' }} />}</TableCell>
                <TableCell className="tableCellForLicensePill">
                  <div className="container-licenses-pills">
                    {row?.incompatibles.map((license) => (
                      <div key={license?.index} className="tinyPillLicenseContainer">
                        <span className="tinyPillLicenseLabel">{license}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
