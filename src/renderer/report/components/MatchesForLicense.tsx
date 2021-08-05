import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 400,
  },
});

export default function MatchesForLicense({ data }) {
  const classes = useStyles();

  console.log(data);

  return (
    <>

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="" align="left">
                Component
              </TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell align="right">Version</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.components.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row" align="left">
                  {row?.name}
                </TableCell>
                <TableCell>{row?.vendor}</TableCell>
                <TableCell align="right">{row?.version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
