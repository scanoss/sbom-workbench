import React, { useEffect, useRef, useState } from 'react';

import {
  Autocomplete, Box,
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
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';
import { filterCryptoByAlgorithms, getDetections, getTypes } from '@shared/adapters/report.adapter';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { cryptographyService } from '@api/services/cryptography.service';
import { CryptographyResponseDTO } from '@api/types';
import { CryptographicItem } from '../../../../../../../main/model/entity/Cryptography';
import { CryptoAlgorithmsPieChart, CryptoChart, TypeDistributionChart } from './components/CryptoChart';

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
  const [detections, setDetections] = useState<Array<string>>([]);
  const [types, setTypes] = useState<Array<string>>([]);

  const [tab, setTab] = useState<string>('local');

  const init = async () => {
    const source = type === SourceType.identified ? SourceType.identified : SourceType.detected;
    const response: CryptographyResponseDTO = await cryptographyService.getAll({ type: source });
    setFilteredItems(response);
    setDetections(getDetections(response.summary.files.typeDetection));
    setTypes(getTypes(response.summary.files.typeDetection));
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
      if (filter && filter?.algorithm?.length <= 0 && filter?.types?.length <= 0) return cryptography;

      // Filter by type and algorithm
      if (filter?.types?.length > 0 && filter?.algorithm?.length > 0) {
        const c =  cryptography.filter((c) => {
          return c.values.some((i) => filter?.types.includes(c.type))
        });
        return filterCryptoByAlgorithms(c, filter.algorithm);
      }
      // Filter by algorithm
      if (filter?.algorithm?.length > 0) {
        return filterCryptoByAlgorithms(cryptography, filter.algorithm);
      }

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

  const handleTab = (value: string)=>  {
    setTab(value);
    if(value === 'local') {
      setTypes(getTypes(data.current.summary.files.typeDetection));
      setDetections(getDetections(data.current.summary.files.typeDetection));
    } else {
      setTypes(getTypes(data.current.summary.components.typeDetection));
      setDetections(getDetections(data.current.summary.components.typeDetection));
    }
  }

  const onTypeChange = (newFilter: ICryptographyFilter) => {
    let detections = [];
    if (tab === 'local') {
      newFilter.types.forEach((i) => {
        detections = [...detections, ...data.current.summary.files.typeDetection[i]]
      })
    } else {
      newFilter.types.forEach((i) => {
        detections = [...detections, ...data.current.summary.components.typeDetection[i]]
      })
    }
    setDetections(detections);
    onFilterHandler(newFilter)
  }

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
        <Box>
          <CryptoChart data={tab === 'local' ? filteredItems?.summary?.files : filteredItems?.summary?.components}></CryptoChart>
        </Box>
        <section className="subheader">
          <nav className="tabs-navigator">
            <Tabs value={tab} onChange={(e, value) => { handleTab(value) } }>
              <Tab value="local" label={`${t('Title:Local')} (${filteredItems?.files.flatMap(file => file.values || []).length})`} />
              <Tab value="component" label={`${t('Title:Components')} (${filteredItems?.components.flatMap(c => c.values || []).length})`} />
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
                    onChange={(e_, types) => onTypeChange({ ...filter, types }) }
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
                    options={detections}
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
                        placeholder="Detections"
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

        {tab === 'local' && (
          <TableContainer
            style={{
              overflow: 'auto',
              marginBottom: '50px',
            }}
            component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:File')}</TableCell>
                  <TableCell>{t('Table:Header:Type')}</TableCell>
                  <TableCell>{t('Table:Header:Detected')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.files.map((item, itemIndex) => (
                  item.values.map((algorithm, algIndex) => (
                    <TableRow key={`${itemIndex}-${algIndex}`}>
                    <TableCell>
                      <Link href="#" underline="hover" color="inherit" onClick={(e) => onSelectFile(e, item.name)}>
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="detections">
                        <span key={algIndex} className="tag">{algorithm}</span>
                    </TableCell>
                  </TableRow>
                ))
                ))}

                {(!filteredItems || filteredItems.files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 'component' && (
          <TableContainer
            style={{
              minHeight: '300px',  // Set your desired height here
              overflow: 'auto',
              marginBottom: '50px',
            }}
            component={Paper}>
            <Table stickyHeader aria-label="cryptography table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Table:Header:Component')}</TableCell>
                  <TableCell>{t('Table:Header:Type')}</TableCell>
                  <TableCell>{t('Table:Header:Detected')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.components.map((item, itemIndex) => (
                  item.values.map((algorithm, algIndex) => (
                  <TableRow key={`${itemIndex}-${algIndex}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="detections">
                      <span className="tag">{algorithm}</span>
                    </TableCell>
                  </TableRow>
                ))
                ))}

                {(!filteredItems || filteredItems.components.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" className="pt-4 pb-4">
                      {!filteredItems ? t('Loading') : t('NoDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </section>
  );
};

export default CryptographyReport;
