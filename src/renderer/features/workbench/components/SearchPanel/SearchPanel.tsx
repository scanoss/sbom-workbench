import React, { useEffect, useRef } from 'react';
import { Box, Button, Chip, makeStyles, TextField } from '@material-ui/core';
import SearchBox from '@components/SearchBox/SearchBox';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';
import { DataGrid } from '@material-ui/data-grid';
import { useHistory } from 'react-router-dom';
import { mapFiles } from '@shared/utils/scan-util';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as SearchUtils from '@shared/utils/search-utils';
import TreeNode from '../TreeNode/TreeNode';
import SearchIcon from '@material-ui/icons/Search';

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
    },
    border: 2,
    '& .MuiDataGrid-cell': {
      border: 0,
      padding: '0 3px',
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
  const [value, setValue] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);

  const goto = (path: string) => {
    history.push({
      pathname: '/workbench/search/file',
      search: `?path=file|${encodeURIComponent(path)}&highlight=${encodeURIComponent(searchQuery.current)}`,
    });
  };

  const onTagsHandler = (tags: string[]) => {
    const nTags = tags
      .map((tag) => tag.toLowerCase().trim())
      .map((tag) => SearchUtils.getTerms(tag))
      .flat();

    const query = nTags.join(' ');
    setValue(nTags);
    ipcRenderer.send(IpcEvents.SEARCH_ENGINE_SEARCH, { query });
    searchQuery.current = query;
  };

  const onSearchResponse = (event, data) => {
    setResults(mapFiles(data));
  };

  const onRowClick = ({ row }, event) => {
    goto(row.path);
  };

  const onCellKeyDown = ({ row }, event) => {
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

  const setupListeners = () => {
    ipcRenderer.on(IpcEvents.SEARCH_ENGINE_SEARCH_RESPONSE, onSearchResponse);
  };
  const removeListeners = () => {
    ipcRenderer.removeListener(IpcEvents.SEARCH_ENGINE_SEARCH_RESPONSE, onSearchResponse);
  };

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
          columns={[
            {
              field: 'filename',
              headerName: `${selected?.length} of ${results?.length} rows selected`,
              editable: false,
              sortable: false,
              flex: 1,
              // eslint-disable-next-line react/display-name
              renderCell: ({ row }) => <TreeNode node={row} />,
            },
          ]}
          rows={results}
          rowHeight={23}
          checkboxSelection
          disableColumnMenu
          disableSelectionOnClick
          hideFooter
          onRowClick={onRowClick}
          onCellKeyDown={onCellKeyDown}
          onSelectionModelChange={onSelectionHandler}
        />
      </main>
      <footer className="panel-footer">
      </footer>
    </div>
  );
}

export default SearchPanel;
