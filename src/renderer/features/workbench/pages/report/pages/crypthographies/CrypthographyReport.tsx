import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  IconButton,
  ListItemText,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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
import { cryptographyService } from '@api/services/cryptography.service';
import { CryptographyResponseDTO } from '@api/types';

// interfaces & types
interface ICryptographyFilter {
  algorithm?: string[];
}

const CryptographyReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const type = useSearchParams().get('type');

  const data = useRef<CryptographyResponseDTO>(null);

  const [items, setItems] = useState<CryptographyResponseDTO>(null);
  const [filter, setFilter] = useState<ICryptographyFilter>(null);

  const [tab, setTab] = useState<string>('local');

  const init = async () => {
    const source = type === SourceType.identified ? SourceType.identified : SourceType.detected;
    const response = await cryptographyService.getAll({ type: source });
    data.current = response;
    setItems(data.current);

    console.log(data.current);
  };

  const onFilterHandler = (newFilter: ICryptographyFilter) => {
    setFilter({ ...filter, ...newFilter });
  };

  // filter items
  useEffect(() => {
    // setItems(filterItems(data.current));
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
          <nav className="tabs-navigator">
            <Tabs value={tab} onChange={(e, value) => setTab(value)}>
              <Tab value="local" label={`${t('Title:Local')} (${items?.files.length})`} />
              <Tab value="sbom" label={`${t('Title:SBOM')} (${items?.components.length})`} />
            </Tabs>
          </nav>
          <form className="default-form">
            <div className="form-row filter">
              <div className="form-group filter-algorithm">
                <Paper>
                  <Autocomplete
                    options={['md5', 'otro']}
                    size="small"
                    disablePortal
                    multiple
                    forcePopupIcon
                    disableCloseOnSelect
                    onChange={(e_, value) => onFilterHandler({ ...filter, algorithm: value })}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox style={{ marginRight: 8 }} checked={selected} size="small" />
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
        {tab === 'local' && (
          <TableContainer className="local-cryptography-table selectable" component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:File')}</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.files.map((item) => (
                  <TableRow key={item.file}>
                    <TableCell>{item.file}</TableCell>
                    <TableCell className="algorithms">{item.algorithms.map((algorithm) => <span className="tag"> {algorithm.algorithm} ({algorithm.strength})</span>)}</TableCell>
                  </TableRow>
                ))}

                {(!items || items.files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      { !items ? t('Loading') : t('NoDataFound') }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 'sbom' && (
          <TableContainer className="sbom-cryptography-table selectable" component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:Component')}</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.components.map((item) => (
                  <TableRow key={item.purl + item.version}>
                    <TableCell>{item.purl}@{item.version}</TableCell>
                    <TableCell className="algorithms">{item.algorithms.map((algorithm) => <span className="tag"> {algorithm.algorithm} ({algorithm.strength})</span>)}</TableCell>
                  </TableRow>
                ))}

                {(!items || items.components.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      { !items ? t('Loading') : t('NoDataFound') }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </main>
    </section>
  );
};

export default CryptographyReport;
