import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  IconButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// interfaces & types
interface ICryptographyFilter {
  algorithm?: string[];
}

type CryptoItem = any; // TODO: get real type

const CryptographyReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const type = useSearchParams().get('type');

  const data = useRef<CryptoItem[]>(null);
  const [items, setItems] = useState<CryptoItem[]>([]);
  const [filter, setFilter] = useState<ICryptographyFilter>(null);

  const init = async () => {
    const source = type === SourceType.identified ? SourceType.identified : SourceType.detected;
    const response = await vulnerabilityService.getAll({ type: source });
    data.current = response;

    setItems(data.current);
  };

  const filterItems = (items: CryptoItem[]) => (filter
    ? items
      .filter((item) => !filter.algorithm || filter.algorithm.length === 0 || filter.algorithm.includes(item.algorithm?.toLowerCase()))
    : items);

  const onFilterHandler = (newFilter: ICryptographyFilter) => {
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
    <section id="CryptographyReportPage" className="app-page">
      <header className="app-header">
        <h4 className="header-subtitle back">
          <IconButton onClick={() => navigate(-1)} component="span">
            <ArrowBackIcon />
          </IconButton>
          Reports
        </h4>
        <h1 className="header-title">{type === SourceType.detected ? t('Title:DetectedCryptography') : t('Title:IdentifiedCryptography')}</h1>
        <section className="subheader">
          <form className="default-form">
            <div className="form-row filter">
              <div className="form-group filter-algorithm">
                <label>{t('Title:Algorithm')}</label>
                <Paper>
                  <Autocomplete
                    options={['md5', 'otro']}
                    disablePortal
                    multiple
                    forcePopupIcon
                    disableCloseOnSelect
                    onChange={(e_, value) => onFilterHandler({ ...filter, algorithm: value })}
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
        <TableContainer className="cryptography-table selectable" component={Paper}>
          <Table stickyHeader aria-label="cryptography table">
            <TableHead>
              <TableRow>
                <TableCell>{t('Table:Header:Component')}</TableCell>
                <TableCell>{t('Table:Header:Algorithm')}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer className="cryptography-table selectable" component={Paper}>
          <Table stickyHeader aria-label="cryptography table">
            <TableHead>
              <TableRow>
                <TableCell>{t('Table:Header:File')}</TableCell>
                <TableCell>{t('Table:Header:Algorithm')}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </section>
  );
};

export default CryptographyReport;
