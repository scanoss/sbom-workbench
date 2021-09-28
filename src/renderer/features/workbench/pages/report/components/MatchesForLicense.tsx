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
  return (
    <>
      <TableContainer >
        <Table className={classes.table} >
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
            {data?.components.map((row,index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row" align="left">
                  <div className="table-cell" >
                    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 7.40234V3.00391C15 2.41797 14.6367 1.89453 14.0859 1.6875L10.4922 0.339844C10.1758 0.21875 9.82422 0.21875 9.50391 0.339844L5.91016 1.6875C5.35938 1.89453 4.99609 2.41797 4.99609 3.00391V7.40234L0.914062 8.9375C0.363281 9.14062 0 9.66797 0 10.2539V14.418C0 14.9492 0.300781 15.4375 0.777344 15.6758L4.62891 17.6016C5.02344 17.8008 5.49219 17.8008 5.88672 17.6016L10 15.5469L14.1133 17.6016C14.5078 17.8008 14.9766 17.8008 15.3711 17.6016L19.2227 15.6758C19.6992 15.4375 20 14.9492 20 14.418V10.2539C20 9.66797 19.6367 9.14453 19.0859 8.9375L15 7.40234ZM10.4688 8.76172V4.9375L14.0625 3.69922V7.51172L10.4688 8.76172ZM5.9375 2.67969L10 1.15625L14.0625 2.67969V2.6875L10 4.11719L5.9375 2.68359V2.67969ZM5.9375 3.69922L9.53125 4.9375V8.76172L5.9375 7.51172V3.69922ZM4.76562 16.5664L0.984375 14.6758V11.0312L4.76562 12.5664V16.5664ZM0.984375 9.96875V9.96093L5.25781 8.35937L9.48047 9.9414V9.98828L5.25781 11.7031L0.984375 9.96875ZM5.75 12.5664L9.48047 11.0508V14.7031L5.75 16.5703V12.5664ZM14.25 16.5664L10.5195 14.7031V11.0547L14.25 12.5703V16.5664ZM19.0156 14.6758L15.2344 16.5664V12.5664L19.0156 11.0312V14.6758ZM19.0156 9.96875L14.7422 11.7031L10.5195 9.98828V9.9414L14.7422 8.35937L19.0156 9.96093V9.96875Z"
                        fill="#3B82F6"
                      />
                    </svg>
                    {row.name}
                  </div>
                </TableCell>
                <TableCell>
                <div className="break-word-table">
                    {row.vendor}
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div className="break-word-table">
                    {row.version}
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
