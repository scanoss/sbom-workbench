/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { Dialog, Paper, DialogActions, Button, Select, MenuItem, TextField, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import React, {useEffect, useState, useContext, useRef} from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import { Inventory } from '@api/types';
import { InventoryForm } from '@context/types';
import { componentService } from '@api/services/component.service';
import { licenseService } from '@api/services/license.service';
import { DialogContext } from '@context/DialogProvider';
import { ResponseStatus } from '@api/Response';
import { useSelector } from 'react-redux';
import { selectComponentState } from '@store/component-store/componentSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '700px',
    },
  },
  usageNotes: {
    display: 'grid',
    gridTemplateColumns: '0.75fr 1fr',
    gridGap: '20px',
  },
  componentVersion: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.75fr',
    gridGap: '20px',
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
    '& .searcher': {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.primary.main,
    },
  },
}));

const filter = createFilterOptions<any>();

interface InventoryDialogProps {
  open: boolean;
  inventory: Partial<InventoryForm>;
  onClose: (inventory: Inventory) => void;
  onCancel: () => void;
}

export const InventoryDialog = (props: InventoryDialogProps) => {
  const classes = useStyles();
  const dialogCtrl = useContext<any>(DialogContext);
  const { t } = useTranslation();

  const { recents } = useSelector(selectComponentState);
  const { isFilterActive } = useSelector(selectNavigationState);

  const { open, inventory, onClose, onCancel } = props;
  const [form, setForm] = useState<Partial<InventoryForm>>(inventory);
  const [components, setComponents] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [licensesAll, setLicensesAll] = useState<any[]>();


  const loaded = useRef<boolean>(false);

  const setDefaults = () => setForm(inventory);

  const onOpenDialog = async () => {
    setDefaults();

    const componentsResponse = await componentService.getAll({ unique: true });
    const licensesResponse = await licenseService.getAll();
    const compCatalogue = componentsResponse.map((component) => ({ ...component, type: 'Catalogued' }));
    setGlobalComponents(compCatalogue);
    const catalogue = licensesResponse.map((item) => ({
      spdxid: item.spdxid,
      name: item.name,
      type: 'Catalogued',
    }));
    setLicensesAll(catalogue);
    setLicenses(catalogue);
    setMatchedLicenses(compCatalogue, inventory, catalogue);

    const component = compCatalogue.find((item) => item.purl === inventory.purl);

    if (component) setVersions(component.versions.map((item) => item.version));
    else loaded.current = true;
  };

  const onCloseDialog = () => {
    loaded.current = false;
    setForm({});
  };

  const openComponentDialog = async () => {
    const response = await dialogCtrl.openComponentDialog();
    if (response && response.action === ResponseStatus.OK) {
      addCustomComponent(response.data);
    }
  };

  const openComponentSearcherDialog = async (query = null) => {
    const response = await dialogCtrl.openComponentSearcherDialog(query);
    if (response && response.action === ResponseStatus.OK) {
      addCustomComponent(response.data);
    }
  };

  const openComponentVersionDialog = async () => {
    // FIXME: This is a hack to get the license name, should be change the component dialog to use spdxid.
    const license = licenses.find((item) => item.spdxid === form.spdxid);
    const response = await dialogCtrl.openComponentDialog(
      { name: form.component, purl: form.purl, url: form.url, license_name: license?.name },
      t('AddVersion')
    );
    if (response && response.action === ResponseStatus.OK) {
      addCustomComponentVersion(response.data);
    }
  };

  const addCustomComponent = async ({ component, created }) => {
    const nComponents = components.filter((item) => item.purl !== component.purl);
    setGlobalComponents([...nComponents, component]);
    if (component.versions[0].licenses[0] !== undefined) {
      setLicenses([
        ...licenses,
        {
          spdxid: component.versions[0].licenses[0].spdxid,
          name: component.versions[0].licenses[0].name,
          type: 'Catalogued',
        },
      ]);
    }
    setForm({
      ...form,
      component: component.name,
      version: component.versions[0].version,
      spdxid: component.versions[0].licenses[0]?.spdxid,
      purl: component.purl,
      url: component.url || '',
    });
  };

  const addCustomComponentVersion = async ({ component, created }) => {
    const nComponents = components.filter((item) => item.purl !== component.purl);
    setGlobalComponents([...nComponents, component]);
    setVersions([created.versions[0].version, ...versions]);

    setForm({
      ...form,
      component: created.name,
      version: created.versions[0].version,
      spdxid: created.versions[0].licenseId,
      purl: created.purl,
      url: created.url || '',
    });
  };

  const setGlobalComponents = (components) => {
    let nRecents = [];
    const nComponents = components.filter((comp) => comp.type !== 'Recents');
    if (recents && recents.length > 0) {
      for (const component of recents) {
        const recent = nComponents
          .filter((item) => item.purl === component)
          .map((comp) => ({ ...comp, type: 'Recents' }));
        nRecents = [...nRecents, ...recent];
      }
    }
    setComponents([...nRecents, ...nComponents]);
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, { spdxid: response.data.spdxid, name: response.data.name, type: 'Catalogued' }]);
      setForm({ ...form, spdxid: response.data.spdxid });
    }
  };

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const componentAutocompleteHandler = (value) => {
    setForm({
      ...form,
      purl: value.purl,
      component: value.name,
    });
  };

  const defaultAutocompleteHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  /**
   * Adds the matched license for purl+version to the list of licenses.
   */
  const setMatchedLicenses = (components, form, all): any[] => {
    const licenses = components
      .find((item) => item?.purl === form?.purl)
      ?.versions.find((item) => item.version === form.version)
      ?.licenses.map((item) => ({
        spdxid: item.spdxid,
        name: item.name,
        type: 'Matched',
      }));

    if (licenses) {
      setLicenses([...licenses, ...all]);
    }
    return licenses;
  };

  const isValid = () => {
    const { version, component, purl, spdxid, usage } = form;
    return spdxid && version && component && purl && usage;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const newInventory: any = form;
    onClose(newInventory);
  };

  useEffect(() => {
    onOpenDialog();
    return () => onCloseDialog();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;

    const component = components.find((item) => item.purl === form.purl);
    if (component) {
      setVersions(component.versions.map((item) => item.version));
      setForm({ ...form, component: component.name, url: component.url || '' });
    }
  }, [form.purl]);

  useEffect(() => {
    if (!loaded.current) return;

    const lic = setMatchedLicenses(components, form, licensesAll);
    if (lic) {
      setForm({ ...form, spdxid: lic[0]?.spdxid });
    }
  }, [form.version]);

  useEffect(() => {
    // FIXME: this is a simple hack to avoid select the first version on default load. We need to decouple the default load of the effects chain
    if (!loaded.current && versions && versions[0]) {
      loaded.current = true;
    } else if (versions && versions[0]) {

      setForm({ ...form, version: versions[0] });
    }
  }, [versions]);

  return (
    <Dialog
      id="InventoryDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <header className="dialog-title">
        <span>{!form.id ? t('Title:IdentifyComponent') : t('Title:EditIdentification')}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <form onSubmit={onSubmit}>
        <div className="dialog-content">
          {isFilterActive && (
            <Alert className="" severity="info">
              {t('ActionCurrentFilterCriteria')}
            </Alert>
          )}
          <div className={`${classes.componentVersion} dialog-row`}>
            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>{t('Title:Component')}</label>
                <IconButton
                  title={t('Tooltip:SearchForComponentsOnline')}
                  tabIndex={-1}
                  color="inherit"
                  size="small"
                  onClick={() => openComponentSearcherDialog()}
                >
                  <SearchIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  title={t('Tooltip:AddNewCustomComponent')}
                  tabIndex={-1}
                  color="inherit"
                  size="small"
                  onClick={() => openComponentDialog()}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </div>
              <Paper className="dialog-form-field-control">
                <Autocomplete
                  size="small"
                  fullWidth
                  clearOnBlur
                  options={components || []}
                  groupBy={(option) => option?.type}
                  value={form.component && form.purl ? { name: form.component, purl: form.purl } : {}}
                  isOptionEqualToValue={(option, value) => option.purl === value.purl}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const { inputValue } = params;
                    // Suggest the search option
                    if (inputValue !== '') {
                      filtered.push({
                        inputValue,
                        search: true,
                        name: t('SearchValueOnline', { value: inputValue}),
                      });
                    }

                    return filtered;
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.purl}>
                      <div className={classes.option}>
                        {option.search ? (
                          <span color="primary" className="searcher">
                            {option.name}
                          </span>
                        ) : (
                          <>
                            <span>{option.name}</span>
                            <span className="middle">{option.purl}</span>
                          </>
                        )}
                      </div>
                    </li>
                  )}
                  disableClearable
                  onChange={(e, value) => {
                    if (value.search) openComponentSearcherDialog(value.inputValue);
                    else componentAutocompleteHandler(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon />,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                />
              </Paper>
            </div>

            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>{t('Title:Version')}</label>
                <IconButton
                  title={t('Tooltip:AddNewVersion')}
                  tabIndex={-1}
                  color="inherit"
                  size="small"
                  onClick={openComponentVersionDialog}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </div>
              <Paper className="dialog-form-field-control">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={versions || []}
                  value={form?.version || null}
                  disableClearable
                  onChange={(e, value) => defaultAutocompleteHandler('version', value)}
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon />,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>{t('Title:License')}</label>
                <IconButton
                  title={t('Tooltip:AddNewLicense')}
                  tabIndex={-1}
                  color="inherit"
                  size="small"
                  onClick={openLicenseDialog}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </div>
              <Paper className="dialog-form-field-control">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={licenses || []}
                  groupBy={(option) => option?.type}
                  value={
                    licenses && form.spdxid
                      ? { spdxid: form.spdxid, name: licenses.find((item) => item.spdxid === form.spdxid)?.name }
                      : null
                  }
                  isOptionEqualToValue={(option: any) => option.spdxid === form.spdxid}
                  getOptionLabel={(option: any) => option.name || option.spdxid || ''}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.spdxid}>
                      <div className={classes.option}>
                        <span>{option.name}</span>
                        <span className="middle">{option.spdxid}</span>
                      </div>
                    </li>
                  )}
                  filterOptions={(options, params) => {
                    return options.filter(
                      (option) =>
                        option.name.toLowerCase().includes(params.inputValue.toLowerCase()) ||
                        option.spdxid.toLowerCase().includes(params.inputValue.toLowerCase())
                    );
                  }}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon />,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                  onChange={(e, value) => defaultAutocompleteHandler('spdxid', value.spdxid)}
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                {t('Title:UR')}L <span className="optional">- {t('Optional')}</span>
              </label>
              <Paper className="dialog-form-field-control">
                <TextField
                  size="small"
                  name="url"
                  fullWidth
                  disabled
                  value={form?.url}
                  onChange={(e) => inputHandler(e)}
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">{t('Title:PURL')}</label>
              <Paper className="dialog-form-field-control">
                <TextField
                  name="purl"
                  size="small"
                  fullWidth
                  disabled
                  value={form?.purl || null}
                  onChange={(e) => inputHandler(e)}
                  required
                />
              </Paper>
            </div>
          </div>

          <div className={`${classes.usageNotes} dialog-row`}>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">{t('Title:Usage')}</label>
              <Paper className="dialog-form-field-control">
                <Select
                  name="usage"
                  size="small"
                  fullWidth
                  value={form?.usage || 'file'}
                  disableUnderline
                  onChange={(e) => inputHandler(e)}
                >
                  <MenuItem value="file">{t('File')}</MenuItem>
                  <MenuItem value="snippet">{t('Snippet')}</MenuItem>
                  <MenuItem value="pre-requisite">{t('PreRequisite')}</MenuItem>
                </Select>
              </Paper>
            </div>

            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                {t('Title:Notes')} <span className="optional">- {t('Optional')}</span>
              </label>
              <Paper className="dialog-form-field-control">
                <TextField
                  name="notes"
                  fullWidth
                  multiline
                  maxRows={4}
                  value={form?.notes || ''}
                  minRows={8}
                  onChange={(e) => inputHandler(e)}
                />
              </Paper>
            </div>
          </div>
        </div>
        <DialogActions>
          <Button tabIndex={-1} onClick={onCancel} color="inherit">
            {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            {t('Button:Identify')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryDialog;
