import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Checkbox,
  Chip,
  IconButton,
  Link,
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

import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';
import { getAlgorithms, getTypes } from '@shared/adapters/report.adapter';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { cryptographyService } from '@api/services/cryptography.service';
import { CryptographyResponseDTO } from '@api/types';
import { CryptographicItem } from '../../../../../../../main/model/entity/Cryptography';

// interfaces & types
interface ICryptographyFilter {
  algorithm?: string[];
  types?: string[];
}

const CryptographyReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const type = useSearchParams().get('type');

  const data = useRef<CryptographyResponseDTO>(null);

  const [filteredItems, setFilteredItems] = useState<CryptographyResponseDTO>(null);
  const [filter, setFilter] = useState<ICryptographyFilter>(null);
  const [algorithms, setAlgorithms] = useState<Array<string>>([]);
  const [types, setTypes] = useState<Array<string>>([]);

  const [tab, setTab] = useState<string>('local');

  const init = async () => {
    const source = type === SourceType.identified ? SourceType.identified : SourceType.detected;
    const response: CryptographyResponseDTO = await cryptographyService.getAll({ type: source });
    setFilteredItems(response);
    setAlgorithms(getAlgorithms(response));
    setTypes(getTypes(response));
    data.current = response;
  };

  const onFilterHandler = (newFilter: ICryptographyFilter) => {
    setFilter({ ...filter, ...newFilter });
  };

  const onSelectFile = async (e, path) => {
    e.preventDefault();
    navigate({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(path)}`,
    });
  };

  // filter items
  useEffect(() => {
    const getFilteredItems = (cryptography: Array<CryptographicItem>) => {
      if (filter && filter?.algorithm?.length <= 0 && filter?.types.length <= 0) return cryptography;

      // Filter by type and algorithm
      if (filter?.types?.length > 0 && filter?.algorithm?.length > 0) {
        return cryptography.filter((c) => {
          return c.values.some((i) => filter?.algorithm?.includes(i)) && filter?.types.includes(c.type);
        });
      }
      // Filter by algorithm
      if (filter?.algorithm?.length > 0) return cryptography.filter((c) => c.values.some((i) => filter?.algorithm?.includes(i)));

      // Filter by type
      if (filter?.types?.length > 0) return cryptography.filter((c) => filter?.types.includes(c.type));

      return cryptography;
    };

    if (!data.current) return;

    const newItems = { ...filteredItems,
      files: getFilteredItems(data.current?.files),
      components: getFilteredItems(data.current.components),
    };
    setFilteredItems(newItems);
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
        <h1 className="header-title">
          {type === SourceType.detected ? t('Title:DetectedCryptography') : t('Title:IdentifiedCryptography')}
        </h1>
        <section className="subheader">
          <nav className="tabs-navigator">
            <Tabs value={tab} onChange={(e, value) => setTab(value)}>
              <Tab value="local" label={`${t('Title:Local')} (${filteredItems?.files.length})`} />
              <Tab value="component" label={`${t('Title:Components')} (${filteredItems?.components.length})`} />
            </Tabs>
          </nav>
          <form className="default-form">
            <div className="form-row filter">
              <div className="form-group filter-algorithm">
                <Paper>
                  <Autocomplete
                    options={types}
                    size="small"
                    disablePortal
                    multiple
                    forcePopupIcon
                    disableCloseOnSelect
                    onChange={(e_, types) => onFilterHandler({ ...filter, types })}
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
                        placeholder="Types"
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
              <div className="form-group filter-algorithm">
                <Paper>
                  <Autocomplete
                    options={algorithms}
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
                        placeholder="Algorithms"
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
                  <TableCell>Type</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.files.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Link href="#" underline="hover" color="inherit" onClick={(e) => onSelectFile(e, item.name)}>
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="algorithms">
                      {item.values.map((algorithm) => (
                        <span className="tag"> {algorithm}</span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}

                {(!filteredItems || filteredItems.files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 'component' && (
          <TableContainer className="component-cryptography-table selectable" component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:Component')}</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>{t('Table:Header:Algorithms')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.components.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="algorithms">
                      {item.values.map((algorithm) => (
                        <span className="tag"> {algorithm}</span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}

                {(!filteredItems || filteredItems.components.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
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
