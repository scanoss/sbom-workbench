import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import SearchBox from '@components/SearchBox/SearchBox';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '@api/ipc-events';
import { DataGrid } from '@material-ui/data-grid';
import { useHistory } from 'react-router-dom';

const SearchPanel = () => {
  const history = useHistory();

  const [results, setResults] = React.useState<any[]>([]);

  const onSearchHandler = (query: string) => {
    ipcRenderer.send(IpcEvents.SEARCH_ENGINE_SEARCH, { query });
  };

  const onSearchResponse = (event, data) => {
    console.log(data);
    setResults(data);
  };

  const onRowClick = ({ row }, event) => {
    history.push({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(row.path)}`,
    });
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
                placeholder="Search keywords"
                onChange={onSearchHandler}
              />
            </div>
          </div>
        </Box>
      </header>
      <main className="panel-body">
        <DataGrid
          columns={[
            {
              field: 'path',
              headerName: 'Results',
              editable: false,
              sortable: false,
              flex: 1,
            },
          ]}
          rows={results}
          rowHeight={26}
          checkboxSelection
          disableColumnMenu
          disableSelectionOnClick
          hideFooterPagination
          onRowClick={onRowClick}
        />
      </main>
      <footer className="panel-footer">
      </footer>
    </div>
  );
}

export default SearchPanel;
