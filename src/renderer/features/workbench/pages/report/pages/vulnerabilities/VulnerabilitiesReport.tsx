import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  IconButton,
  Paper, Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField, Typography,
} from '@mui/material';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import TableCellActions from '@components/TableCellActions/TableCellActions';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { ComponentVulnerability } from '../../../../../../../main/model/entity/ComponentVulnerability'; // TODO: use alias?

// interfaces & types
interface IVulnerabilitiesFilter {
  component?: string;
  severity?: string[]; // TODO: enum from dto
}

const VulnerabilitiesReport = () => {
  const type = useSearchParams().get('type');
  const data = useRef<ComponentVulnerability[]>(null);

  const [items, setItems] = useState<ComponentVulnerability[]>([]);
  const [components, setComponent] = useState<any[]>([]);
  const [filter, setFilter] = useState<IVulnerabilitiesFilter>(null);
  const [popoverContent, setPopoverContent] = useState<string>(null);

  const [anchorElPopover, setAnchorElPopover] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorElPopover);

  const init = async () => {
    const source = type === SourceType.identified ? SourceType.identified : SourceType.detected;
    const response = await vulnerabilityService.getAll({ type: source });
    data.current = response;

    console.log(response)

    setItems(data.current);
    setComponent(Array.from(new Set(data.current.map((item) => item.componentVersion.name))));
  };

  const filterItems = (items: ComponentVulnerability[]) => {
    return filter
      ? items
          .filter((item) => !filter.component || item.componentVersion.name === filter.component)
          .filter((item) => !filter.severity || filter.severity.length === 0 || filter.severity.includes(item.vulnerability.severity?.toLowerCase()))
      : items;
  };

  const onSeeDescriptionClickHandler = (e, item: ComponentVulnerability) => {
    setPopoverContent(item.vulnerability.summary);
    setAnchorElPopover(e.currentTarget);
  };

  const onFilterHandler = (newFilter: IVulnerabilitiesFilter) => {
    setFilter({ ...filter, ...newFilter });
  };

  // filter items
  useEffect(() => {
    setItems(filterItems(data.current));
  }, [filter]);

  // on mounted
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <section id="VulnerabilitiesReportPage" className="app-page">
        <header className="app-header">
          <h1 className="header-title">{ type === SourceType.detected ? 'Detected' : 'Identified'} Vulnerabilities</h1>
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
                      onChange={(e_, value) => onFilterHandler({ component: value })}
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
                      forcePopupIcon
                      disableCloseOnSelect
                      onChange={(e_, value) => onFilterHandler({ ...filter, severity: value })}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox style={{ marginRight: 8 }} checked={selected} />
                          <span className={`tag tag-${option} option` }> {option} </span>
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
          <TableContainer className="vulnerabilities-table selectable" component={Paper}>
            <Table stickyHeader aria-label="vulnerabilities table">
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
                  <TableRow key={item.purl + item.version + item.vulnerability.cve}>
                    <TableCell>{item.componentVersion.name}</TableCell>
                    <TableCell>
                      <span className={`tag tag-${item.vulnerability.severity?.toLowerCase()}`}>{item.vulnerability.severity}</span>
                    </TableCell>
                    <TableCell><a
                                  href={`https://nvd.nist.gov/vuln/detail/${item.vulnerability.cve}`}
                                  target="_blank" rel="noreferrer">
                                    {item.vulnerability.cve}
                                  </a>
                    </TableCell>
                    <TableCell>{item.vulnerability.source}</TableCell>
                    <TableCell>{item.vulnerability.introduced}</TableCell>
                    <TableCell>{item.vulnerability.reported}</TableCell>
                    <TableCell>{item.vulnerability.patched}</TableCell>
                    <TableCellActions>
                      <IconButton
                        title="See description"
                        aria-label="see description"
                        size="small"
                        onClick={(e) => onSeeDescriptionClickHandler(e, item)}
                      >
                        <ReceiptLongOutlinedIcon fontSize="inherit" />
                      </IconButton>
                    </TableCellActions>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </main>
      </section>

      <Popover
        open={open}
        anchorEl={anchorElPopover}
        onClose={() => setAnchorElPopover(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2, maxWidth: 300 }}>{popoverContent}</Typography>
      </Popover>
    </>
  );
};

export default VulnerabilitiesReport;
