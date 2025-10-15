import React, { useEffect, useRef } from 'react';
import { Chip, IconButton, styled, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText } from '@mui/material';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { AppConfigDefault } from '@config/AppConfigDefault';
import { useTranslation } from 'react-i18next';
import TreeNode from '../TreeNode/TreeNode';
import { cryptographyService } from '@api/services/cryptography.service';

// For the data grid
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-columnHeader': {
    fontSize: '12px',
    fontWeight: '400 !important',
    padding: '0 0 0 12px',
    '& .MuiDataGrid-columnSeparator': {
      display: 'none',
    },
  },
  '& .MuiDataGrid-columnHeaderCheckbox': {
    '& .MuiSvgIcon-root': {
      width: '0.85em',
      height: '0.85em',
    },
  },
  '& .MuiTablePagination-caption': {
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  '& .MuiTablePagination-actions': {
    marginLeft: 10,
  },
  border: 2,
  '& .MuiDataGrid-cell': {
    border: 0,
    padding: '0 3px 0 25px',
    cursor: 'pointer',
  },
  '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
    visibility: 'hidden',
    '& .MuiSvgIcon-root': {
      width: '0.85em',
      height: '0.85em',
    },
  },
  '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
    visibility: 'visible !important',
  },
  '& .MuiDataGrid-row:hover': {
    '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
      visibility: 'visible',
    },
  },
  '& .MuiButtonBase-root ': {
    padding: 0,
  },
}));

const CryptoSearchPanel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const serverPage = useRef(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 100 });
  const [fileResults, setFileResults] = React.useState<any[]>([]);
  const [detectedKeysInFiles, setDetectedKeysInFiles] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = React.useState<string[]>([]);
  const [detectedCryptoKeys, setDetectedCryptoKeys] = React.useState<string[]>([]);

  const search = async () => {
   const results =  await cryptographyService.search(selectedAlgorithms);
   // Transform file paths into DataGrid-compatible objects
   const formattedResults = results.files.map((filePath, index) => ({
     id: index,
     path: filePath,
     filename: filePath.split('/').pop() || filePath,
   }));

   setFileResults(formattedResults);
   setDetectedKeysInFiles(results.crypto);
  };

  const goto = (path: string) => {
    navigate({
      pathname: '/workbench/crypto-search/file',
      search: `?path=${encodeURIComponent(path)}&crypto=${encodeURIComponent(detectedKeysInFiles.join(','))}`,
    });
  };

  const loadKeys = async () => {
    const cryptoKeys = await cryptographyService.getDetectedKeys();
    setDetectedCryptoKeys(cryptoKeys);
  }


  const onRowClickHandler = ({ row }, event) => {
    goto(row.path);
  };

  const onCellKeyDownHandler = ({ row }, event) => {
    if (event.code === 'Enter') {
      goto(row.path);
    }
  };

  const onSelectionHandler = (data, details) => {
    setSelected(data);
  };

  const onPaginationModelChangeHandler = (model: GridPaginationModel) => {
    setPaginationModel(model);
    const nextPageServer = Math.floor((model.page + 1) / (AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT / 100));
    if (nextPageServer > serverPage.current) {
      serverPage.current = nextPageServer;
      search();
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="panel panel-left search-panel-container">
      <header className="panel-header border-bottom p-3 pr-2 pb-1">
        <div className="panel-title">
          <h4>Cryptography Search</h4>
        </div>
        <div className="search-panel mt-3">
          <div className="search-panel-input d-flex align-center">
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <InputLabel id="crypto-algorithm-label">Keys</InputLabel>
              <Select
                labelId="crypto-algorithm-label"
                multiple
                value={selectedAlgorithms}
                size="small"
                label="Keys"
                onChange={(e) => setSelectedAlgorithms(e.target.value as string[])}
                endAdornment={
                  selectedAlgorithms.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlgorithms([]);
                        setFileResults([]);
                      }}
                      sx={{ mr: 2 }}
                    >
                      <i className="ri-close-circle-line" style={{ fontSize: '16px' }} />
                    </IconButton>
                  )
                }
                renderValue={(selected) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 4px' }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value?.toUpperCase()}
                        size="small"
                        sx={{ fontSize: '0.6rem', height: '15px' }}
                      />
                    ))}
                  </div>
                )}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    paddingY: 0.5,
                  }
                }}
              >
                {detectedCryptoKeys.map((key) => (
                  <MenuItem
                    key={key}
                    value={key}
                    sx={{ padding: '4px 8px', minHeight: 'auto' }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedAlgorithms?.indexOf(key) > -1}
                      sx={{ padding: '4px' }}
                    />
                    <ListItemText
                      primary={key?.toUpperCase()}
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              size="small"
              onClick={search}
              sx={{ ml: 1 }}
            >
              <i className="ri-search-line" />
            </IconButton>
          </div>
        </div>
      </header>
      <main className="panel-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <IconButton
          disabled={selected?.length === 0}
          size="small"
          sx={{
            position: 'absolute',
            top: 9,
            right: 9,
            zIndex: 1,
          }}
        >
          <i className="ri-more-line" />
        </IconButton>
        <StyledDataGrid
          rows={fileResults}
          columns={[
            {
              field: `files (${fileResults.length})`,
              editable: false,
              sortable: false,
              flex: 1,
              // eslint-disable-next-line react/display-name
              renderCell: ({ row }) => <TreeNode node={row} />,
            },
          ]}
          localeText={{
            MuiTablePagination: {
              labelDisplayedRows: ({ from, to, count }) =>
                `${from} - ${to} ${t('of')} ${
                  count >= (serverPage.current + 1) * AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT ? `+${count}` : count
                }`,
            },
          }}
          rowHeight={24}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChangeHandler}
          pageSizeOptions={[100]}
          disableColumnMenu
          hideFooterSelectedRowCount
          columnHeaderHeight={41}
          disableRowSelectionOnClick
          onRowClick={onRowClickHandler}
          onCellKeyDown={onCellKeyDownHandler}
          onRowSelectionModelChange={onSelectionHandler}
          sx={{ flex: 1, overflow: 'hidden' }}
        />
      </main>
      <footer className="panel-footer" />
    </div>
  );
};

export default CryptoSearchPanel;
