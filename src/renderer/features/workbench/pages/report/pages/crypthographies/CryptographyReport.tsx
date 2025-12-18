import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete, Box,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SourceType } from '@api/dto';
import useSearchParams from '@hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';
import { filterCryptoByAlgorithms, getDetections, getTypes } from '@shared/adapters/report.adapter';
import { cryptographyService } from '@api/services/cryptography.service';
import { CryptographyResponseDTO } from '@api/types';
import { CryptographicItem } from '../../../../../../../main/model/entity/Cryptography';
import { CryptoChart } from './components/CryptoChart';
import { LocalCryptographyTable } from './components/LocalCryptographyTable';
import { ComponentCryptographyTable } from './components/ComponentCryptographyTable';
import SearchBox from '@components/SearchBox/SearchBox';

// icons
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// interfaces & types
interface ICryptographyFilter {
  algorithm?: string[];
  types?: string[];
  searchQuery?: string;
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

  // Memoized filter function to avoid memory issues with large datasets
  const getFilteredItems = useMemo(() => {
    return (cryptography: Array<CryptographicItem>) => {
      if (!cryptography) return [];

      // Cache lowercase search query once
      const searchQueryLower = filter?.searchQuery?.toLowerCase() || '';
      const hasSearchQuery = searchQueryLower.length > 0;
      const hasTypes = filter?.types?.length > 0;
      const hasAlgorithms = filter?.algorithm?.length > 0;

      // No filters active - return original array without creating a new one
      if (!hasSearchQuery && !hasTypes && !hasAlgorithms) {
        return cryptography;
      }

      let result = cryptography;

      // Filter by search query (file/component name)
      if (hasSearchQuery) {
        result = result.filter((c) => c.name.toLowerCase().includes(searchQueryLower));
      }

      // Filter by type and algorithm
      if (hasTypes && hasAlgorithms) {
        const c = result.filter((c) => filter.types.includes(c.type));
        return filterCryptoByAlgorithms(c, filter.algorithm);
      }

      // Filter by algorithm only
      if (hasAlgorithms) {
        return filterCryptoByAlgorithms(result, filter.algorithm);
      }

      // Filter by type only
      if (hasTypes) {
        return result.filter((c) => filter.types.includes(c.type));
      }

      return result;
    };
  }, [filter?.searchQuery, filter?.types, filter?.algorithm]);

  // Apply filters when filter changes
  useEffect(() => {
    if (!data.current) return;
    setFilteredItems({
      ...data.current,
      files: getFilteredItems(data.current.files),
      components: getFilteredItems(data.current.components),
    });
  }, [getFilteredItems]);

  // Memoize counts to avoid expensive flatMap on every render
  const filesCount = useMemo(() => {
    if (!filteredItems?.files) return 0;
    let count = 0;
    for (const file of filteredItems.files) {
      count += file.values?.length || 0;
    }
    return count;
  }, [filteredItems?.files]);

  const componentsCount = useMemo(() => {
    if (!filteredItems?.components) return 0;
    let count = 0;
    for (const component of filteredItems.components) {
      count += component.values?.length || 0;
    }
    return count;
  }, [filteredItems?.components]);

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
    let validAlgorithms = [];
    const detectionSource = tab === 'local'
      ? data.current.summary.files.typeDetection
      : data.current.summary.components.typeDetection;

    // Populate detections based on whether filter types exist
    if (newFilter?.types?.length) {
      detections = newFilter.types.reduce((result, type) => {
        return [...result, ...detectionSource[type]];
      }, []);
      validAlgorithms = newFilter?.algorithm?.filter(algo => detections.includes(algo));
    } else {
      detections = getDetections(detectionSource);
    }

    // Create updated filter with valid algorithms only
    const updatedFilter = {
      ...newFilter,
      algorithm: validAlgorithms
    };

    setDetections(detections);
    // Update the filter
    onFilterHandler(updatedFilter);
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
          {t('Title:Reports')}
        </h4>
        <h1 className="header-title">
          {type === SourceType.detected ? t('Title:DetectedCryptography') : t('Title:IdentifiedCryptography')}
        </h1>
        <Box>
          <CryptoChart
            data={tab === 'local' ? filteredItems?.summary?.files : filteredItems?.summary?.components}
          ></CryptoChart>
        </Box>
        <section className="subheader">
          <nav className="tabs-navigator">
            <Tabs
              value={tab}
              onChange={(e, value) => {
                handleTab(value);
              }}
            >
              <Tab
                value="local"
                label={`${t('Title:Local')} (${filesCount})`}
              />
              <Tab
                value="component"
                label={`${t('Title:Components')} (${componentsCount})`}
              />
            </Tabs>
          </nav>
          <form className="default-form">
            <div className="form-row filter">
              <div className="form-group filter-search">
                <Paper>
                  <SearchBox
                    placeholder={t('Common:SearchByFileNameOrPurl')}
                    responseDelay={500}
                    onChange={(value) => onFilterHandler({ ...filter, searchQuery: value })}
                  />
                </Paper>
              </div>
              <div className="form-group filter-algorithm">
                <Paper>
                  <Autocomplete
                    options={types}
                    size="small"
                    disablePortal
                    multiple
                    forcePopupIcon
                    disableCloseOnSelect
                    onChange={(e_, types) => onTypeChange({ ...filter, types })}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox style={{ marginRight: 8 }} checked={selected} size="small" />
                        <span className={`tag tag-${option} option`}> {option} </span>
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
                        placeholder={t('Common:Types')}
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
                    key={detections.join('-')}
                    value={filter?.algorithm?.filter((algo) => detections.includes(algo))}
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
                        placeholder={t('Common:Detections')}
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
        <>
          <LocalCryptographyTable data={filteredItems}></LocalCryptographyTable>
        </>
      )}

      {tab === 'component' && (
        <ComponentCryptographyTable data={filteredItems} />
      )}
    </section>
  );
};

export default CryptographyReport;
