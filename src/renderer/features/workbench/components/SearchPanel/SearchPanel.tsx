import React, { useEffect } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import SearchBox from '@components/SearchBox/SearchBox';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';
import { DataGrid } from '@material-ui/data-grid';
import { useHistory } from 'react-router-dom';
import { mapFiles } from '@shared/utils/scan-util';
import TreeNode from '../TreeNode/TreeNode';

const useStyles = makeStyles((theme) => ({
  button: {
    position: 'absolute',
    top: 12,
    right: 8,
    zIndex: 1,
  },
  dataGrid: {
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

  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);

  const onSearchHandler = (query: string) => {
    ipcRenderer.send(IpcEvents.SEARCH_ENGINE_SEARCH, { query });
  };

  const onSearchResponse = (event, data) => {
    setResults(
      mapFiles(data)
    );
  };

  const onRowClick = ({ row }, event) => {
    history.push({
      pathname: '/workbench/search/file',
      search: `?path=file|${encodeURIComponent(row.path)}`,
    });
  };

  const onSelectionHandler = (data, details) => {
    setSelected(data)
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
        <Box boxShadow={1} className="p-3">
          <div className="panel-title">
            <h4>Search</h4>
          </div>
          <div className="search-panel mt-3">
            <div className="search-panel-input">
              <SearchBox
                placeholder="Search by keywords"
                onChange={onSearchHandler}
              />
            </div>
          </div>
        </Box>
      </header>
      <main className="panel-body">
        <Button size="small" className={classes.button} onClick={onIdentifyAllHandler}>Identify All</Button>
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
          hideFooterPagination
          onRowClick={onRowClick}
          onSelectionModelChange={onSelectionHandler}
        />
      </main>
      <footer className="panel-footer">
      </footer>
    </div>
  );
}

export default SearchPanel;
