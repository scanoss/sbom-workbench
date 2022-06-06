import React, { SetStateAction, useEffect, useRef } from 'react';
import { Box, Button, makeStyles, TextField } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';
import { DataGrid } from '@material-ui/data-grid';
import { useHistory } from 'react-router-dom';
import { mapFiles } from '@shared/utils/scan-util';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as SearchUtils from '@shared/utils/search-utils';
import SearchIcon from '@material-ui/icons/Search';
import { AppConfigDefault } from '@config/AppConfigDefault';
import TreeNode from '../TreeNode/TreeNode';
import { ISearchResult } from '../../../../../main/task/search/searchTask/ISearchResult';

const useStyles = makeStyles((theme) => ({
  button: {
    position: 'absolute',
    top: 12,
    right: 8,
    zIndex: 1,
  },
  searchInput: {
    '& .MuiInputBase-input': {
      fontSize: '0.8rem',
      padding: '7px 0px !important',
    },
  },
  dataGrid: {
    '& .MuiDataGrid-columnHeader': {
      fontSize: '0.7rem',
      marginBottom: 10,
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
      padding: '0 10px 0 20px', //  padding: '0 3px'
    },
    '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
      visibility: 'hidden',
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

  const onIdentifyAllHandler = () => {
    console.log('Identify all');
  };

  const onPageChangeHandler = (localPageNumber, details) => {
    setLocalPage(localPageNumber);
    const nextPageServer = Math.floor( (localPageNumber + 1)  / (AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT / 100));
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
      <header className="panel-header">
        <Box boxShadow={1} className="p-3 pr-2 pb-1">
          <div className="panel-title">
            <h4>Search</h4>
          </div>
          <div className="search-panel mt-3">
            <div className="search-panel-input d-flex align-center">
              <SearchIcon className="start-icon mr-1" />
              <Autocomplete
                multiple
                fullWidth
                forcePopupIcon
                size="small"
                options={['license', 'copyright', 'author', 'version']}
                freeSolo
                value={value}
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
        </Box>
      </header>
      <main className="panel-body">
        {/* <Button size="small" className={classes.button} onClick={onIdentifyAllHandler}>Identify All</Button> */}
        <DataGrid
          className={classes.dataGrid}
          rows={results}
          columns={[
            {
              field: 'filename',
              headerName: `${selected?.length} rows selected`,
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
          checkboxSelection={false}
          disableColumnMenu
          rowsPerPageOptions={[AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT]}
          hideFooterSelectedRowCount
          hideFooterRowCount
          headerHeight={0}
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
