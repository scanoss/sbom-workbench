import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  IconButton, Link, ListItemText,
  Paper, Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import TableCellActions from '@components/TableCellActions/TableCellActions';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom'; // TODO: use alias?
import { ComponentVulnerability } from '../../../../../../../main/model/entity/ComponentVulnerability';

// interfaces & types
interface IVulnerabilitiesFilter {
  component?: string;
  severity?: string[]; // TODO: enum from dto
}

const VulnerabilitiesReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

    setItems(data.current);
    setComponent(Array.from(new Set(data.current.map((item) => item.componentVersion.name))));
  };

  const filterItems = (items: ComponentVulnerability[]) => (filter
    ? items
      .filter((item) => !filter.component || item.componentVersion.name === filter.component)
      .filter((item) => !filter.severity || filter.severity.length === 0 || filter.severity.includes(item.vulnerability.severity?.toLowerCase()))
    : items);

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
          <h4 className="header-subtitle back pl-3">
            <IconButton onClick={() => navigate(-1)} component="span">
              <ArrowBackIcon />
            </IconButton>
            Reports
          </h4>
          <h1 className="header-title">{type === SourceType.detected ? t('Title:DetectedVulnerabilities') : t('Title:IdentifiedVulnerabilities')}</h1>
          <section className="subheader">
            <form className="default-form">
              <div className="form-row filter">
                <div className="form-group">
                  <label>{t('Title:Component')}</label>
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
                  <label>{t('Title:Severity')}</label>
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
                          <span className={`tag tag-${option} option`}> {option} </span>
                        </li>
                      )}
                      renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => (
                        <Chip
                          key={option}
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          className={`tag tag-${option} mr-1`}
                        />
                      ))}
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
                  <TableCell>{t('Table:Header:Component')}</TableCell>
                  <TableCell>{t('Table:Header:Severity')}</TableCell>
                  <TableCell>{t('Table:Header:CVE')}</TableCell>
                  <TableCell>{t('Table:Header:Source')}</TableCell>
                  <TableCell>{t('Table:Header:Published')}</TableCell>
                  <TableCell>{t('Table:Header:Modified')}</TableCell>
                  <TableCell width={70} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.purl + item.version + item.vulnerability.cve}>
                    <TableCell className="pb-0 pt-0">
                      <ListItemText
                        primary={item.componentVersion.name}
                        secondary={`${item.componentVersion.purl}@${item.componentVersion.version}`}
                      />
                    </TableCell>
                    <TableCell>
                      <span className={`tag tag-${item.vulnerability.severity?.toLowerCase()}`}>{item.vulnerability.severity}</span>
                    </TableCell>
                    <TableCell><Link
                      className="d-flex align-center"
                      href={`https://nvd.nist.gov/vuln/detail/${item.vulnerability.cve}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.vulnerability.cve}  <OpenInNewOutlinedIcon className="external-link" fontSize="small" />
                               </Link>
                    </TableCell>
                    <TableCell>{item.vulnerability.source}</TableCell>
                    <TableCell>{item.vulnerability.published}</TableCell>
                    <TableCell>{item.vulnerability.modified}</TableCell>
                    <TableCellActions>
                      {item.vulnerability.summary
                        && (
                        <IconButton
                          title={t('Tooltip:SeeDescription')}
                          aria-label="see description"
                          size="small"
                          onClick={(e) => onSeeDescriptionClickHandler(e, item)}
                        >
                          <ReceiptLongOutlinedIcon fontSize="inherit" />
                        </IconButton>
                        )}
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
