import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { componentService } from '@api/services/component.service';
import { DataGrid } from '@material-ui/data-grid';
import useApi from '@hooks/useApi';
import { IComponentResult } from '../../../main/task/componentCatalog/iComponentCatalog/IComponentResult';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  search: {
    padding: '10px 0px 10px 10px',
  },
  dataGrid: {
    height: 400,
    '& .MuiDataGrid-cell': {
      fontSize: 12,
    },
    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none !important',
    },
  },
}));

interface ComponentSearcherDialogProps {
  open: boolean;
  query: string;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const ComponentSearcherDialog = (props: ComponentSearcherDialogProps) => {
  const classes = useStyles();
  const { open, query, onClose, onCancel } = props;
  const { data, error, loading, execute } = useApi<IComponentResult[]>();

  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);
  const [queryTerm, setQueryTerm] = useState<string>('');

  const handleSearch = async (e) => {
    e.preventDefault();
    execute(() => componentService.getGlobalComponents({ search: queryTerm, limit: 100 }));
  };

  const onSelectionHandler = (data) => {
    setSelected(data);
  };

  const handleClose = async (e) => {
    e.preventDefault();
    // const compSelected = results.find((el) =>  );


    try {
      console.log('handleClose');
    } catch (error: any) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    setResults(data ? data.map((value, index) => ({ ...value, id: index })) : []);
  }, [data]);

  return (
    <Dialog
      id="ComponentSearcherDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">Search components online</span>

      <form onSubmit={handleSearch}>
        <div className="dialog-content">
          <div className="dialog-row">
            <div className="dialog-form-field d-flex space-between">
              <Paper className="dialog-form-field-control w-100 mr-4">
                <InputBase
                  disabled={loading}
                  name="search"
                  fullWidth
                  value={queryTerm}
                  placeholder="Search"
                  onChange={(e) => setQueryTerm(e.target.value)}
                />
                {loading && <CircularProgress size={18} className="mr-2" /> }
              </Paper>

              <Button disabled={loading} type="submit" variant="outlined" color="primary">
                Search
              </Button>
            </div>
          </div>
        </div>
      </form>

      <form onSubmit={handleClose}>
        <DataGrid
          className={classes.dataGrid}
          rows={results}
          columns={[
            { field: 'component', width: 120 },
            { field: 'purl', flex: 1 },
            { field: 'url', flex: 1 },
          ]}
          localeText={{ noRowsLabel: 'No results found' }}
          rowHeight={22}
          disableColumnMenu
          disableColumnSelector
          onSelectionModelChange={onSelectionHandler}
          hideFooter
        />
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button disabled={selected.length === 0} type="submit" variant="contained" color="secondary">
            Select
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComponentSearcherDialog;
