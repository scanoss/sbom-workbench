import React, { useContext, useEffect, useState } from 'react';
import {Dialog, Paper, IconButton, CircularProgress, TextField, Button, Link} from '@mui/material';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { componentService } from '@api/services/component.service';
import { DataGrid } from '@mui/x-data-grid';
import useApi from '@hooks/useApi';
import { importGlobalComponent } from '@store/component-store/componentThunks';
import { useDispatch } from 'react-redux';
import { DialogContext } from '@context/DialogProvider';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import { AppDispatch } from '@store/store';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';
import { packages } from '@assets/data/ComponentCatalogPackages';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { projectService } from '@api/services/project.service';
import AppConfig from '@config/AppConfigModule';
import { IComponentResult } from '../../../main/task/componentCatalog/iComponentCatalog/IComponentResult';
import { ISearchComponent } from '../../../main/task/componentCatalog/iComponentCatalog/ISearchComponent';

interface ComponentSearcherDialogProps {
  open: boolean;
  query: string;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const ComponentSearcherDialog = (props: ComponentSearcherDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { open, query, onClose, onCancel } = props;
  const { data, error, loading, execute } = useApi<IComponentResult[]>();
  const dialogCtrl = useContext<any>(DialogContext);
  const [results, setResults] = React.useState<any[]>(null);
  const [queryTerm, setQueryTerm] = useState<ISearchComponent>(null);
  const [advancedSearch, setAdvancedSearch] = useState<boolean>(false);
  const [componentSelected, setComponentSelected] = useState<IComponentResult>(null);

  const [disabled, setDisabled] = useState<boolean>(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const { search, vendor, component, package: pck } = queryTerm;

    const params = advancedSearch
      ? { vendor, component, package: pck, limit: 100 }
      : { search, package: pck, limit: 100 };

    execute(() => componentService.getGlobalComponents(params));
  };

  const init = async () => {
    const response = await projectService.getApiKey();
    setQueryTerm({ search: '', package: '', component: '', vendor: '' });
    setDisabled(!response);
  };

  const destroy = async () => {
    setResults(null);
    setQueryTerm(null);
  };

  const onRowClickHandler = async ({ row }, event) => {
    setComponentSelected({ ...row });
  };

  const handleClose = async () => {
    try {
      const dialogResponse = await dialogCtrl.openConfirmDialog(
        `<h3 class='mt-0 mb-0'>Import Component</h3><p>Do you want to add <b>${componentSelected.component}</b> to your catalog?</p>`,
        { label: 'Add to catalog', role: 'accept' },
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

  useEffect(() => {
    setResults(data ? data.map((value, index) => ({ ...value, id: index })) : []);
  }, [data]);

  useEffect(() => {
    if (open) init();
    else destroy();
  }, [open]);

  useEffect(() => {
    if (componentSelected) handleClose();
  }, [componentSelected]);

  return (
    <Dialog
      id="ComponentSearcherDialog"
      className="dialog"
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <header className="dialog-title">
        <span>Online Component Search</span>
        <IconButton aria-label="close" onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <main className="dialog-content">
        <form onSubmit={handleSearch}>
          {disabled && (
            <Alert icon={<WarningAmberOutlinedIcon fontSize="inherit" />} severity="error" className="alert">
              You need to provide an API key in the settings to search components online.{' '}
              <Link
                color="inherit"
                href={`${AppConfig.SCANOSS_WEBSITE_URL}/pricing`}
                target="_blank"
                rel="noreferrer"
              >
                Get yours now.
              </Link>
            </Alert>
          )}

          <div className="dialog-row searcher">
            {!advancedSearch ? (
              <div className="dialog-form-field">
                <div className="dialog-form-field-label">
                  <label>Search</label>
                </div>
                <Paper className="dialog-form-field-control w-100 mr-4">
                  <TextField
                    name="search"
                    size="small"
                    disabled={loading || disabled}
                    fullWidth
                    value={queryTerm?.search || ''}
                    onChange={(e) => setQueryTerm({ ...queryTerm, search: e.target.value })}
                    InputProps={{
                      endAdornment: loading ? <CircularProgress size={18} className="mr-2" /> : '',
                    }}
                  />
                </Paper>
              </div>
            ) : (
              <>
                <div className="dialog-form-field">
                  <div className="dialog-form-field-label">
                    <label>Name</label>
                  </div>
                  <Paper className="dialog-form-field-control w-100 mr-4">
                    <TextField
                      name="name"
                      size="small"
                      disabled={loading || disabled}
                      fullWidth
                      value={queryTerm?.component || ''}
                      onChange={(e) => setQueryTerm({ ...queryTerm, component: e.target.value })}
                      InputProps={{
                        endAdornment: loading ? <CircularProgress size={18} className="mr-2" /> : '',
                      }}
                    />
                    {loading && <CircularProgress size={18} className="mr-2" />}
                  </Paper>
                </div>
                <div className="dialog-form-field">
                  <div className="dialog-form-field-label">
                    <label>Vendor</label>
                  </div>
                  <Paper>
                    <TextField
                      name="vendor"
                      disabled={loading || disabled}
                      size="small"
                      fullWidth
                      value={queryTerm?.vendor || ''}
                      onChange={(e) => setQueryTerm({ ...queryTerm, vendor: e.target.value })}
                    />
                  </Paper>
                </div>
              </>
            )}
            <div className="dialog-form-field package">
              <div className="dialog-form-field-label">
                <label>Package</label>
              </div>
              <Paper className="dialog-form-field-control">
                <Autocomplete
                  size="small"
                  options={packages}
                  disabled={loading || disabled}
                  fullWidth
                  onChange={(event, value) => {
                    setQueryTerm({ ...queryTerm, package: value || '' });
                  }}
                  getOptionLabel={(option) => option.toString()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                />
              </Paper>
            </div>

            <IconButton disabled={loading || disabled} type="submit" size="large">
              <SearchIcon />
            </IconButton>
          </div>
          <div className="dialog-row mt-2">
            <Button color="primary" size="small" onClick={() => setAdvancedSearch(!advancedSearch)}>
              <CompareArrowsIcon className="mr-1" />
              {advancedSearch ? 'Standard search' : 'Advanced search'}
            </Button>
          </div>
        </form>

        <form onSubmit={handleClose}>
          <DataGrid
            className="results-datagrid"
            rows={results || []}
            columns={[
              { field: 'component', width: 150 },
              { field: 'purl', flex: 1 },
              { field: 'url', flex: 1 },
            ]}
            localeText={{ noRowsLabel: loading ? 'Searching...' : results === null ? '' : 'No results found' }}
            rowHeight={22}
            disableColumnMenu
            disableColumnSelector
            onRowClick={onRowClickHandler}
            hideFooter
          />
        </form>
      </main>
    </Dialog>
  );
};

export default ComponentSearcherDialog;
