import React, { useState } from 'react';

import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import TableCellActions from '@components/TableCellActions/TableCellActions';

const VulnerabilitiesReport = () => {
  const [data, setData] = useState<any[]>(
    Array(20)
      .fill(null)
      .map((i, index) => ({
        component: 'Angular',
        severity: 'medium',
        cve: `CVE-2014-8181${index}`,
        source: 'Nvd',
        introduced: '3.2.7',
        reported: '3.2.7',
        patched: '3.2.8',
      }))
  );

  const onSeeDescriptionClickHandler = (_e, item) => {};
  const onCopyCVEClickHandler = (_e, item) => {};

  return (
    <>
      <section id="VulnerabilitiesReportPage" className="app-page">
        <header className="app-header">
          <h1 className="header-title">Detected Vulnerabilities</h1>
          <section className="subheader">Filter</section>
        </header>
        <main className="app-content">
          <TableContainer component={Paper}>
            <Table stickyHeader className="selectable" aria-label="vulnerabilities table">
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>CVE</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Introduced</TableCell>
                  <TableCell>Reported</TableCell>
                  <TableCell>Patched</TableCell>
                  <TableCell width={70} />
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item.cve}>
                    <TableCell>{item.component}</TableCell>
                    <TableCell>{item.severity}</TableCell>
                    <TableCell>{item.cve}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.introduced}</TableCell>
                    <TableCell>{item.reported}</TableCell>
                    <TableCell>{item.patched}</TableCell>
                    <TableCellActions>
                      <IconButton
                        title="See description"
                        aria-label="see description"
                        size="small"
                        onClick={(e) => onSeeDescriptionClickHandler(e, item)}
                      >
                        <ReceiptLongOutlinedIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        title="Copy CVE"
                        aria-label="copy cve"
                        size="small"
                        onClick={(e) => onCopyCVEClickHandler(e, item)}
                      >
                        <ContentCopyOutlinedIcon fontSize="inherit" />
                      </IconButton>
                    </TableCellActions>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </main>
      </section>
    </>
  );
};

export default VulnerabilitiesReport;
