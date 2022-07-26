import React, { useState } from 'react';
import {IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

const VulnerabilitiesReport = () => {
  const [data, setData] = useState<any[]>([
    {
      component: 'Angular',
      severity: 'medium',
      cve: 'CVE-2014-8180',
      source: 'Nvd',
      introduced: '3.2.7',
      reported: '3.2.7',
      patched: '3.2.8',
    },
  ]);
  return (
    <>
      <section id="VulnerabilitiesReportPage" className="app-page">
        <header className="app-header">
          <h1 className="header-title">Detected Vulnerabilities</h1>
          <section className="subheader">filters</section>
        </header>
        <main className="app-content">
          <TableContainer component={Paper}>
            <Table className="projects-table" aria-label="projects table">
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
                {data?.map((vulnerability) => (
                  <TableRow key={vulnerability.cve}>
                    <TableCell>{vulnerability.component}</TableCell>
                    <TableCell>{vulnerability.severity}</TableCell>
                    <TableCell>{vulnerability.cve}</TableCell>
                    <TableCell>{vulnerability.source}</TableCell>
                    <TableCell>{vulnerability.introduced}</TableCell>
                    <TableCell>{vulnerability.reported}</TableCell>
                    <TableCell>{vulnerability.patched}</TableCell>
                    <TableCell className="table-actions">
                      <IconButton aria-label="description" size="small">
                        <ReceiptLongOutlinedIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton aria-label="description" size="small">
                        <ContentCopyOutlinedIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
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
