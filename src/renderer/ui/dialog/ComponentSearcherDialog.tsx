import {
  Dialog,
  Paper,
  Button,
  IconButton,
  makeStyles,
  InputBase,
  CircularProgress,
  TextField,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { componentService } from '@api/services/component.service';
import { DataGrid } from '@material-ui/data-grid';
import useApi from '@hooks/useApi';
import { importGlobalComponent } from '@store/component-store/componentThunks';
import { useDispatch } from 'react-redux';
import { DialogContext } from '@context/DialogProvider';
import { Autocomplete } from '@material-ui/lab';
import { AppDispatch } from '@store/store';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import SearchIcon from '@material-ui/icons/Search';
import { packages } from '@assets/data/ComponentCatalogPackages';
import CloseIcon from '@material-ui/icons/Close';
import { IComponentResult } from '../../../main/task/componentCatalog/iComponentCatalog/IComponentResult';
import { ISearchComponent } from '../../../main/task/componentCatalog/iComponentCatalog/ISearchComponent';

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
  title: {
    fontSize: 22,
    fontStyle: 'normal',
    fontWeight: 400,
    letterSpacing: 0,
  },
  titleContainer: {
    display: 'flex',
    flexFlow: 'row',
    borderBottom: '1px solid #D4D4D8',
    height: 55,
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
  const dispatch = useDispatch<AppDispatch>();
  const { open, query, onClose, onCancel } = props;
  const { data, error, loading, execute } = useApi<IComponentResult[]>();
  const dialogCtrl = useContext<any>(DialogContext);
  const [results, setResults] = React.useState<any[]>([]);
  const [queryTerm, setQueryTerm] = useState<ISearchComponent>({ search: '', package: '', component: '', vendor: '' });
  const [advanceSearch, setAdavanceSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('Advanced search');
  const [componentSelected, setComponentSelected] = useState<IComponentResult>(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (advanceSearch) {
      const { vendor, component } = queryTerm;
      execute(() =>
        componentService.getGlobalComponents({ ...{ vendor, component, package: queryTerm.package }, limit: 100 })
      );
    } else {
      const { search } = queryTerm;
      execute(() => componentService.getGlobalComponents({ ...{ search, packages: queryTerm.package }, limit: 100 }));
    }
  };

  const onRowClickHandler = async ({ row }, event) => {
    setComponentSelected({ ...row });
  };

  const handleClose = async () => {
    try {
      const dialogResponse = await dialogCtrl.openConfirmDialog(
        `<h3>Import Component</h3><p>Do you want to add ${componentSelected.component} to your catalogue?</p>`,
        { label: 'Add to Catalogue', role: 'accept' },
        false
      );
      if (dialogResponse.action === DIALOG_ACTIONS.OK) {
        const response = await dispatch(importGlobalComponent(componentSelected)).unwrap();
        if (response) onClose({ action: DIALOG_ACTIONS.OK, data: { component: response } });
      }
    } catch (error: any) {
      await dialogCtrl.openConfirmDialog(error.message, { label: 'Accept', role: 'accept' }, true);
      console.log('error', error);
    }
  };

  const setAdvancedSearch = () => {
    setAdavanceSearch(!advanceSearch);
    if (searchText === 'Standard Search') setSearchText('Advanced Search');
    else setSearchText('Standard Search');
  };

  useEffect(() => {
    setResults(data ? data.map((value, index) => ({ ...value, id: index })) : []);
  }, [data]);

  useEffect(() => {
    if (componentSelected) handleClose();
  }, [componentSelected]);

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
      <div className={classes.titleContainer}>
        <div
          style={{
            display: 'flex',
            width: '70%',
            justifyContent: 'flex-start',
            paddingLeft: '3%',
            alignItems: 'center',
          }}
        >
          <p className={classes.title}>Online Component Search</p>
        </div>
        <div style={{ display: 'flex', width: '30%', justifyContent: 'flex-end' }}>
          <IconButton aria-label="close" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="dialog-content">
          <div className="dialog-row">
            <div className="dialog-form-field d-flex space-between">
              {advanceSearch === false ? (
                <Paper className="dialog-form-field-control w-100 mr-4">
                  <InputBase
                    disabled={loading}
                    name="search"
                    fullWidth
                    value={queryTerm.search}
                    placeholder="Search"
                    onChange={(e) => setQueryTerm({ ...queryTerm, search: e.target.value })}
                  />
                  {loading && <CircularProgress size={18} className="mr-2" />}
                </Paper>
              ) : (
                <>
                  <Paper className="dialog-form-field-control w-100 mr-4">
                    <InputBase
                      disabled={loading}
                      name="Name"
                      fullWidth
                      value={queryTerm.component}
                      placeholder="Name"
                      onChange={(e) => setQueryTerm({ ...queryTerm, component: e.target.value })}
                    />
                    {loading && <CircularProgress size={18} className="mr-2" />}
                  </Paper>
                  <div>
                    <Paper>
                      <InputBase
                        disabled={loading}
                        name="Vendor"
                        fullWidth
                        value={queryTerm.vendor}
                        placeholder="Vendor"
                        onChange={(e) => setQueryTerm({ ...queryTerm, vendor: e.target.value })}
                      />
                      {loading && <CircularProgress size={18} className="mr-2" />}
                    </Paper>
                  </div>
                </>
              )}

              <div>
                <Autocomplete
                  id="combo-box-demo"
                  options={packages}
                  onChange={(event, value) => {
                    setQueryTerm({ ...queryTerm, package: value || '' });
                  }}
                  getOptionLabel={(option) => option.toString()}
                  style={{
                    width: 150,
                    height: 10,
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Package"
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                    />
                  )}
                />
              </div>
              <IconButton disabled={loading} type="submit">
                {' '}
                <SearchIcon />
              </IconButton>
            </div>
          </div>
          <div className="dialog-row">
            <IconButton style={{ fontSize: '10px', borderRadius: '0' }} onClick={setAdvancedSearch}>
              {' '}
              <CompareArrowsIcon style={{ fontSize: '20px', paddingRight: '2px' }} />
              {searchText}
            </IconButton>
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
          onRowClick={onRowClickHandler}
          hideFooter
        />
      </form>
    </Dialog>
  );
};

export default ComponentSearcherDialog;
