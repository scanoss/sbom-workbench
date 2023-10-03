import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, IconButton, InputBase, MenuItem, Paper, Select, Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { IWorkspaceCfg } from '@api/types';
import { userSettingService } from '@api/services/userSetting.service';
import AppConfig from '@config/AppConfigModule';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { AppI18n } from '@shared/i18n';

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '600px',
    },
  },
  new: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.primary.light,
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    padding: 6,
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
  },
}));

interface NewEndpointDialogProps {
  open: boolean;
  defaultData: any;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const NewEndpointDialog = (props: NewEndpointDialogProps) => {
  const { t } = useTranslation();

  const {
    open, onClose, onCancel, defaultData,
  } = props;

  const initial = {
    URL: '',
    API_KEY: '',
    DESCRIPTION: '',
  };
  const [data, setData] = useState<any>(initial);

  const isValid = () => data.URL.trim().length > 0;

  const onSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      const nData = {
        ...data,
        URL: data.URL?.replace(/\/$/, ''),
      };

      onClose({ action: DIALOG_ACTIONS.OK, data: nData });
    }
  };

  const setDefaults = () => {
    setData(defaultData || initial);
  };

  useEffect(setDefaults, [open]);

  return (
    <Dialog id="NewEndpointDialog" maxWidth="xs" fullWidth className="dialog" open={open} onClose={onCancel}>
      <form onSubmit={onSubmit}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">API URL</label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="url"
                size="small"
                fullWidth
                value={data.URL}
                onChange={(e) => setData({ ...data, URL: e.target.value })}
                required
                autoFocus
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">
              API KEY
              {' '}
              <span className="optional">
                -
                {t('Optional')}
              </span>
            </label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="apikey"
                size="small"
                fullWidth
                value={data.API_KEY}
                onChange={(e) => setData({ ...data, API_KEY: e.target.value })}
              />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button color="inherit" tabIndex={-1} onClick={onCancel}>
            {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            {t('Button:Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface SettingDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const SettingDialog = ({ open, onClose, onCancel }: SettingDialogProps) => {
  const { t, i18n } = useTranslation();

  const [selectedApi, setSelectedApi] = useState(null);
  const [apis, setApis] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);
  const [language, setLanguage] = useState<string>('en');
  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });

  const classes = useStyles();

  const submit = async () => {
    const config: Partial<IWorkspaceCfg> = {
      DEFAULT_API_INDEX: selectedApi ? apis.findIndex((api) => api === selectedApi) : -1,
      APIS: apis,
      TOKEN: sbomLedgerToken || null,
      LNG: language || 'en',
    };

    await userSettingService.set(config);
    onClose({ action: DIALOG_ACTIONS.OK });
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    const {
      DEFAULT_API_INDEX, APIS, TOKEN, LNG,
    } = config;

    const urlsDefault = APIS || [];
    const selectedUrlDefault = APIS && APIS[DEFAULT_API_INDEX] ? APIS[DEFAULT_API_INDEX] : null;

    setSbomLedgerToken(TOKEN);
    setApis(urlsDefault);
    setSelectedApi(selectedUrlDefault);
    setLanguage(LNG);
  };

  const fetchConfig = async () => {
    const config = await userSettingService.get();
    setDefault(config || {});
  };

  const onNewEndpointHandler = () => {
    setApiDialog({ ...apiDialog, open: true, data: null });
  };

  const onCloseDialogHandler = (response: DialogResponse) => {
    setApiDialog({ ...apiDialog, open: false });
    setSelectedApi(response.data);
    setApis([...apis, response.data]);
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  const handleOnChange = (event, newValue) => {
    if (typeof newValue === 'string') {
      setSelectedApi({
        url: newValue,
      });
    } else if (newValue && newValue.new) {
      const value = {
        URL: newValue.inputValue,
        API_KEY: '',
      };
      setApiDialog({ ...apiDialog, open: true, data: value });
    } else {
      setSelectedApi(newValue);
    }
  };

  const handleTrash = (e, option) => {
    e.stopPropagation();
    setApis(apis.filter((url) => url !== option));
    if (selectedApi && option.url === selectedApi.url) {
      setSelectedApi(null);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  return (
    <>
      <Dialog
        id="SettingsDialog"
        maxWidth="md"
        scroll="body"
        className={`${classes.size} dialog`}
        fullWidth
        open={open}
        onClose={onCancel}
      >
        <header className="dialog-title">
          <span>{t('Title:Settings')}</span>
          <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
            <CloseIcon />
          </IconButton>
        </header>

        <form onSubmit={handleClose}>
          <div className="dialog-content">
            {AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS && (
              <>
                <div className="dialog-form-field">
                  <label className="dialog-form-field-label">
                    <b>{t('Title:APIConnections')}</b>
                  </label>
                </div>
                <div className="dialog-form-field">
                  <div className="dialog-form-field-label">
                    <label>{t('Title:KnowledgebaseAPI')}</label>
                    <Tooltip title={t('Tooltip:AddNewEndpoint')} onClick={onNewEndpointHandler}>
                      <IconButton tabIndex={-1} color="inherit" size="small">
                        <AddIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Paper className="dialog-form-field-control">
                    <Autocomplete
                      fullWidth
                      value={selectedApi}
                      onChange={handleOnChange}
                      onKeyPress={(e: any) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const { value } = e.target;
                          const isExisting = apis.some((option) => value === option.URL);
                          if (!isExisting) {
                            handleOnChange(e, { new: true, inputValue: value });
                          } else {
                            setSelectedApi({ URL: value });
                          }
                        }
                      }}
                      filterOptions={(options, params) => {
                        const filtered = filter(options, params);

                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        const isExisting = options.some((option) => inputValue === option.URL);
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({
                            inputValue,
                            new: true,
                            URL: t('ClickOrEnterToAddValue', { value: inputValue }),
                          });
                        }

                        return filtered;
                      }}
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      options={apis}
                      getOptionLabel={(option) => {
                        // Value selected with enter, right from the input
                        if (typeof option === 'string') {
                          return option;
                        }
                        // Add "xxx" option created dynamically
                        if (option.inputValue) {
                          return option.inputValue;
                        }
                        // Regular option
                        return `${option.URL} ${option.API_KEY ? `(${option.API_KEY})` : ''}`;
                      }}
                      renderOption={(props, option, { selected }) => (option.new ? (
                        <li {...props} className={classes.new}>
                          {option.URL}
                        </li>
                      ) : (
                        <li {...props}>
                          <article className="w-100 d-flex space-between align-center">
                            <div className={classes.option}>
                              <span>{option.URL}</span>
                              {option.API_KEY && (
                                <span className="middle">
                                  API KEY:
                                  {option.API_KEY}
                                </span>
                              )}
                            </div>
                            <IconButton
                              size="small"
                              aria-label="delete"
                              className="btn-delete"
                              onClick={(e) => handleTrash(e, option)}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </article>
                        </li>
                      ))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                          }}
                        />
                      )}
                    />
                  </Paper>
                  <p className="dialog-form-field-hint">
                    {t('SettingsApiKeyHint')}
                  </p>
                </div>
              </>
            )}
            <div
              className={AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS ? 'dialog-form-field mt-7' : 'dialog-form-field'}
            >
              <label className="dialog-form-field-label">
                {t('Title:SBOMLedgerToken')}
                {' '}
                <span className="optional">
                  -
                  {t('Optional')}
                </span>
              </label>
              <Paper className="dialog-form-field-control">
                <TextField
                  name="token"
                  fullWidth
                  value={sbomLedgerToken}
                  onChange={(e) => setSbomLedgerToken(e.target.value)}
                />
              </Paper>
            </div>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                <b>{t('Title:Language')}</b>
              </label>
              <Paper className="dialog-form-field-control">
                <Select
                  name="usage"
                  size="small"
                  fullWidth
                  disableUnderline
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as string)}
                >

                  {AppI18n.getLanguages().map((item) => <MenuItem key={item.key} value={item.key}>{item.value}</MenuItem>)}
                </Select>
              </Paper>
            </div>
          </div>
          <DialogActions>
            <Button tabIndex={-1} color="inherit" onClick={onCancel}>
              {t('Button:Cancel')}
            </Button>
            <Button type="submit" variant="contained" color="secondary">
              {t('Button:Save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <NewEndpointDialog
        open={apiDialog.open}
        defaultData={apiDialog.data}
        onCancel={() => setApiDialog({ ...apiDialog, open: false })}
        onClose={(e) => onCloseDialogHandler(e)}
      />
    </>
  );
};

export default SettingDialog;
