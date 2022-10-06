import React from 'react';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTranslation } from 'react-i18next';
import IconComponent from "../../../components/IconComponent/IconComponent";

const useStyles = makeStyles({
  table: {
    minWidth: 400,
    '& .MuiTableCell-root': {
      padding: '6px 12px',
    }
  },
});

export default function MatchesForLicense({ data }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <TableContainer className="mt-2">
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="left">{t('Table:Header:Component')}</TableCell>
              <TableCell>{t('Table:Header:Vendor')}</TableCell>
              <TableCell align="right">{t('Table:Header:Version')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="selectable">
            {data.components.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row" align="left">
                  <div className="table-cell">
                    <IconComponent name={row.vendor} size={24} />
                    <div className="d-flex flex-column">
                      <span>{row.name}</span>
                      <span className="small">{row.purl}</span>
                    </div>

                  </div>
                </TableCell>
                <TableCell width="140">
                  <div className="break-word-table">{row.vendor}</div>
                </TableCell>
                <TableCell width="80" align="right">
                  <div className="break-word-table">{row.version}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
