import React, { useContext, useEffect, useState } from 'react';
import {Dialog, Paper, IconButton, CircularProgress, TextField, Button, Link, DialogActions} from '@mui/material';
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
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { packages } from '@assets/data/ComponentCatalogPackages';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { projectService } from '@api/services/project.service';
import AppConfig from '@config/AppConfigModule';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {ComponentResultDTO, SearchComponentDTO} from "@api/dto";
import { Trans, useTranslation } from 'react-i18next';
import IconComponent from '../../features/workbench/components/IconComponent/IconComponent';
import {IComponentResult} from "../../../main/task/componentCatalog/iComponentCatalog/IComponentResult";

interface ComponentSearcherDialogProps {
  open: boolean;
  query: string;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const ComponentSearcherDialog = (props: ComponentSearcherDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { open, query, onClose, onCancel } = props;
  const { data, error, loading, execute } = useApi<ComponentResultDTO[]>();
  const dialogCtrl = useContext<any>(DialogContext);
  const [results, setResults] = React.useState<any[]>(null);
  const [queryTerm, setQueryTerm] = useState<SearchComponentDTO>(null);
  const [advancedSearch, setAdvancedSearch] = useState<boolean>(false);
  const [componentSelected, setComponentSelected] = useState<ComponentResultDTO>(null);

  const [disabled, setDisabled] = useState<boolean>(false);

  const init = async () => {
    const defaultQuery = { search: query, package: 'github', component: '', vendor: '' };
    setQueryTerm(defaultQuery);
    if (query) search(defaultQuery);

    // api key validation
    const response = await projectService.getApiKey();
    setDisabled(!response);
  };

  const search = (query: SearchComponentDTO = null) => {
    const { search, vendor, component, package: pck } = query || queryTerm;

    const params = advancedSearch
      ? { vendor, component, package: pck, limit: 100 }
      : { search: search.trim(), package: pck, limit: 100 };

    setResults(null);
    execute(() => componentService.getGlobalComponents(params));
  };

  const destroy = async () => {
    setAdvancedSearch(false);
    setResults(null);
    setQueryTerm(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    search();
  };

  const onSelectionModelChange = (data, details) => {
    const componentSelected: IComponentResult = results?.find((el) => el.id === data[0]);
    setComponentSelected(componentSelected);
  };

  const handleClose = async (e) => {
    e.preventDefault();

    const dialog = await dialogCtrl.createProgressDialog(t('ImportingComponent'));
    try {
      const dialogResponse = await dialogCtrl.openConfirmDialog(
        `<p class='mt-0 mb-0'>${t('Dialog:AddComponentToCatalog', {component: componentSelected.component, interpolation: {escapeValue: false}})}</p>`,
        { label: t('Button:AddToTheCatalog'), role: 'accept' },
        false
      );
      if (dialogResponse.action === DIALOG_ACTIONS.OK) {
        dialog.present();
        const response = await dispatch(importGlobalComponent(componentSelected)).unwrap();
        await dialog.dismiss();
        if (response) onClose({ action: DIALOG_ACTIONS.OK, data: { component: response } });
      }
    } catch (error: any) {
      dialog.dismiss();
      await dialogCtrl.openConfirmDialog(error.message, { label: t('Button:Accept'), role: 'accept' }, true);
      console.log('error', error);
    }
  };

  const Message = () => {
    if (error)
      return (
        <Alert severity="error" className="alert">
          {error.toString()}
        </Alert>
      );

    return (
      <>
        {loading ? (
          <>
            <CircularProgress size={18} className="mr-2" /> {t('SearchingDots')}
          </>
        ) : results === null ? '' : t('NoResultsFound')}
      </>
    );
  };

  useEffect(() => {
    setResults(data ? data.map((value, index) => ({ ...value, id: index })) : []);
  }, [data]);

  useEffect(() => {
    if (open) init();
    else destroy();
  }, [open]);

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
        <span>{t('Title:OnlineComponentSearch')}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <main className="dialog-content">
        <form onSubmit={handleSearch} className="mb-3">
          {disabled && (
            <Alert icon={<WarningAmberOutlinedIcon fontSize="inherit" />} severity="error" className="alert">
              <Trans i18nKey="NeedApiKeyComponents" components={{
                1: <Link
                    color="inherit"
                    href={`${AppConfig.ORGANIZATION_URL}/pricing`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }}
               />
            </Alert>
          )}

          <div className="dialog-row searcher">
            {!advancedSearch ? (
              <div className="dialog-form-field">
                <div className="dialog-form-field-label">
                  <label>{t('Search')}</label>
                </div>
                <Paper className="dialog-form-field-control w-100 mr-4">
                  <TextField
                    name="search"
                    size="small"
                    autoFocus
                    disabled={loading || disabled}
                    fullWidth
                    value={queryTerm?.search || ''}
                    onChange={(e) => setQueryTerm({ ...queryTerm, search: e.target.value })}
                  />
                </Paper>
              </div>
            ) : (
              <>
                <div className="dialog-form-field">
                  <div className="dialog-form-field-label">
                    <label>{t('Title:Name')}</label>
                  </div>
                  <Paper className="dialog-form-field-control w-100 mr-4">
                    <TextField
                      name="name"
                      size="small"
                      disabled={loading || disabled}
                      fullWidth
                      value={queryTerm?.component || ''}
                      onChange={(e) => setQueryTerm({ ...queryTerm, component: e.target.value })}
                    />
                  </Paper>
                </div>
                <div className="dialog-form-field">
                  <div className="dialog-form-field-label">
                    <label>{t('Title:Vendor')}</label>
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
                <label>{t('Title:Package')}</label>
              </div>
              <Paper className="dialog-form-field-control">
                <Autocomplete
                  size="small"
                  value={queryTerm?.package || ''}
                  options={packages}
                  disabled={loading || disabled}
                  disableClearable
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
            <Button
              startIcon={<RepeatOutlinedIcon />}
              color="primary"
              size="small"
              onClick={() => setAdvancedSearch(!advancedSearch)}
            >
              {advancedSearch ? t('Button:StandarSearch') : t('Button:AdvancedSearch')}
            </Button>
          </div>
        </form>

        <DataGrid
          className="data-grid-result"
          rows={results || []}
          columns={[
            {
              field: 'component',
              headerName: t('Table:Header:Component'),
              width: 170,
              sortable: false,
              renderCell: ({ row }) => (
                <div className="component-name-cell" title={row.component}>
                  <IconComponent name={row.component} size={24} />
                  <h3>{row.component}</h3>
                </div>
              ),
            },
            { field: 'purl', headerName: t('Table:Header:PURL'), flex: 1, sortable: false },
            {
              field: 'url',
              headerName: t('Table:Header:URL'),
              flex: 1,
              sortable: false,
              renderCell: ({ row }) =>
                row.url && (
                  <div className="url-cell d-flex">
                    <Link
                      href={row.url}
                      tabIndex={-1}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      color="primary"
                      className="d-flex align-center"
                    >
                      {row.url}
                      <OpenInNewOutlinedIcon fontSize="inherit" className="ml-1" />
                    </Link>
                  </div>
                ),
            },
          ]}
          localeText={{ noRowsLabel: (<Message />) as unknown as string }}
          headerHeight={40}
          rowHeight={22}
          disableColumnMenu
          onSelectionModelChange={onSelectionModelChange}
          hideFooter
        />
      </main>

      <form onSubmit={handleClose}>
        <DialogActions>
          <Button tabIndex={-1} onClick={onCancel} color="inherit">
           {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!componentSelected}>
           {t('Button:AddToTheCatalog')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComponentSearcherDialog;
