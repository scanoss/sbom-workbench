import React, { SetStateAction, useContext, useEffect, useRef } from 'react';
import { Chip, IconButton, makeStyles, TextField } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';
import { DataGrid } from '@material-ui/data-grid';
import { useHistory } from 'react-router-dom';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as SearchUtils from '@shared/utils/search-utils';
import { AppConfigDefault } from '@config/AppConfigDefault';
import TreeNode from '../TreeNode/TreeNode';
import { DIALOG_ACTIONS } from '@context/types';
import { executeBatch } from '@store/inventory-store/inventoryThunks';
import { InventoryAction } from '@api/types';
import { useDispatch } from 'react-redux';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import useBatch from '@hooks/useBatch';

const electron = window.require('electron');
const { remote } = electron;
const { Menu } = remote;

const useStyles = makeStyles((theme) => ({
  button: {
    position: 'absolute',
    top: 9,
    right: 9,
    zIndex: 1,
  },
  autocomplete: {
    '& .MuiAutocomplete-endAdornment': {

    },
  },
  searchInput: {
    '& .MuiInputBase-input': {
      fontSize: '0.8rem',
      padding: '7px 0px !important',
    },
  },
  dataGrid: {
    '& .MuiDataGrid-columnHeader': {
      fontSize: '12px',
      fontWeight: '400 !important',
      padding: 0,
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
      padding: '0 3px',
    },
    '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
      visibility: 'hidden',

      '& .MuiSvgIcon-root': {
        width: '0.85em',
        height: '0.85em',
      },
    },
    '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox[data-value=true]': {
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
  },
}));

const SearchPanel = () => {
  const history = useHistory();
  const classes = useStyles();
  const searchQuery = useRef(null);

  const dispatch = useDispatch();
  const batch = useBatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const serverPage = useRef(0);
  const [localPage, setLocalPage] = React.useState(0);

  const [value, setValue] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);

  const search = () => {
    ipcRenderer.send(IpcEvents.SEARCH_ENGINE_SEARCH, {
      query: searchQuery.current,
      params: {
        offset: serverPage.current * AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT,
        limit: AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT,
      },
    });
  };

  const goto = (path: string) => {
    history.push({
      pathname: '/workbench/search/file',
      search: `?path=file|${encodeURIComponent(path)}&highlight=${encodeURIComponent(searchQuery.current)}`,
    });
  };

  const onTagsHandler = (tags: string[]) => {
    serverPage.current = 0;
    setLocalPage(0);

    const nTags = tags
      .map((tag) => tag.toLowerCase().trim())
      .map((tag) => SearchUtils.getTerms(tag))
      .flat();

    searchQuery.current = nTags.join(' ');
    setValue(nTags);
  };

  const onSearchResponse = (event, data) => {
    setResults(serverPage.current === 0 ? data : (oldState) => [...oldState, ...data]);
  };

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

  const onMenuActionHandler = () => {
    const menu = [
      {
        label: 'Identify all files as...',
        click: batch.identifyAll,
      },
      {
        label: 'Mark all files as original',
        click: () => batch.ignoreAll,
      },
    ];

    Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  };

  const onPageChangeHandler = (localPageNumber, details) => {
    setLocalPage(localPageNumber);
    const nextPageServer = Math.floor((localPageNumber + 1) / (AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT / 100));
    if (nextPageServer > serverPage.current) {
      serverPage.current = nextPageServer;
      search();
    }
  };

  // trigger the search on value change
  useEffect(() => {
    search();
  }, [value]); //

  const setupListeners = () => {
    ipcRenderer.on(IpcEvents.SEARCH_ENGINE_SEARCH_RESPONSE, onSearchResponse);
  };

  const removeListeners = () => {
    ipcRenderer.removeListener(IpcEvents.SEARCH_ENGINE_SEARCH_RESPONSE, onSearchResponse);
  };

  // on mount/unmount listeners
  useEffect(setupListeners, []);
  useEffect(() => () => removeListeners(), []);

  return (
    <div className="panel panel-left search-panel-container">
      <header className="panel-header border-bottom p-3 pr-2 pb-1">
        <div className="panel-title">
          <h4>Keyword Search</h4>
        </div>
        <div className="search-panel mt-3">
          <div className="search-panel-input d-flex align-center">
            <i className="ri-search-line mr-1" />
            <Autocomplete
              className={classes.autocomplete}
              multiple
              fullWidth
              size="small"
              options={['license', 'copyright', 'author', 'version']}
              freeSolo
              value={value}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  // eslint-disable-next-line react/jsx-key
                  <Chip
                    color="primary"
                    variant="outlined"
                    size="small"
                    label={option}
                    {...getTagProps({ index })}
                    className="bg-primary mr-1"
                  />
                ))
              }
              onChange={(event, data) => onTagsHandler(data)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className={classes.searchInput}
                  autoFocus
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    placeholder: value.length === 0 ? 'Search by keywords' : '',
                    disableUnderline: true,
                  }}
                />
              )}
            />
          </div>
        </div>
      </header>
      <main className="panel-body">
        <IconButton
          disabled={selected?.length === 0}
          size="small"
          className={classes.button}
          onClick={onMenuActionHandler}
        >
          <i className="ri-more-line" />
        </IconButton>
        <DataGrid
          className={classes.dataGrid}
          rows={results}
          columns={[
            {
              field: 'filename',
              headerName: `${selected?.length} files selected`,
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
                `${from} - ${to} of ${
                  count >= (serverPage.current + 1) * AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT ? `+${count}` : count
                }`,
            },
          }}
          rowHeight={23}
          page={localPage}
          disableColumnMenu
          rowsPerPageOptions={[AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT]}
          hideFooterSelectedRowCount
          hideFooterRowCount
          checkboxSelection
          headerHeight={41}
          disableSelectionOnClick
          onPageChange={onPageChangeHandler}
          onRowClick={onRowClickHandler}
          onCellKeyDown={onCellKeyDownHandler}
          onSelectionModelChange={onSelectionHandler}
        />
      </main>
      <footer className="panel-footer" />
    </div>
  );
};

export default SearchPanel;
