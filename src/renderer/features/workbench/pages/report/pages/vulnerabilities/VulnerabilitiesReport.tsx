import React, { useEffect, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import TableCellActions from '@components/TableCellActions/TableCellActions';

// interfaces & types
interface IVulnerabilitiesFilter {
  component?: string;
  severity?: string[]; // TODO: enum from dto
}

const VulnerabilitiesReport = () => {
  const [data, setData] = useState<any[]>(
    Array(20)
      .fill(null)
      .map((i, index) => ({
        component: `Angular-${index}`,
        severity: 'medium',
        cve: `CVE-2014-8181${index}`,
        source: 'Nvd',
        introduced: '3.2.7',
        reported: '3.2.7',
        patched: '3.2.8',
      }))
  );

  const [components, setComponent] = useState<any[]>([]);
  const [filter, setFilter] = useState<IVulnerabilitiesFilter>(null);

  const filterItems = (items) => {
    return filter
      ? items
          .filter((item) => !filter.component || item.component === filter.component)
          .filter((item) => !filter.severity || filter.severity.length === 0 || filter.severity.includes(item.severity))
      : items;
  };

  const items = filterItems(data);

  const onSeeDescriptionClickHandler = (_e, item) => {};
  const onCopyCVEClickHandler = (_e, item) => {};

  // set component searcher options
  useEffect(() => {
    setComponent(Array.from(new Set(data.map((item) => item.component))));
  }, [data]);

  useEffect(() => {
  }, [filter]);

  return (
    <>
      <section id="VulnerabilitiesReportPage" className="app-page">
        <header className="app-header">
          <h1 className="header-title">Detected Vulnerabilities</h1>
          <section className="subheader">
            <form className="default-form">
              <div className="form-row filter">
                <div className="form-group">
                  <label>Component</label>
                  <Paper>
                    <Autocomplete
                      id="input-component"
                      options={components}
                      disablePortal
                      onChange={(e_, value) => setFilter({ ...filter, component: value })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <SearchIcon />,
                          }}
                        />
                      )}
                    />
                  </Paper>
                </div>

                <div className="form-group filter-severity">
                  <label>Severity</label>
                  <Paper>
                    <Autocomplete
                      options={['critical', 'high', 'medium', 'low']}
                      disablePortal
                      multiple
                      limitTags={2}
                      forcePopupIcon
                      disableCloseOnSelect
                      onChange={(e_, value) => setFilter({ ...filter, severity: value })}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox style={{ marginRight: 8 }} checked={selected} />
                          {option}
                        </li>
                      )}
                      renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                          <Chip
                            key={option}
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            className={`tag tag-${option} mr-1`}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <SearchIcon className="mr-1" />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Paper>
                </div>
              </div>
            </form>
          </section>
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
                {items?.map((item) => (
                  <TableRow key={item.cve}>
                    <TableCell>{item.component}</TableCell>
                    <TableCell>
                      <span className={`tag tag-${item.severity}`}>{item.severity}</span>
                    </TableCell>
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
