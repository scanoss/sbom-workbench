import React, { MouseEvent, SyntheticEvent, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { userSettingService } from '@api/services/userSetting.service';
import AppConfig from '@config/AppConfigModule';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { AppI18n } from '@shared/i18n';
import { setApis as workbenchStoreApi } from '@store/workspace-store/workspaceSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/store';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiFormValues, globalSettingsFormSchema, GlobalSettingsFormValues } from 'renderer/features/workspace/domain';
import { mapToWorkspaceConfig } from 'renderer/features/workspace/encode';
import ProxyConfigSetup from 'renderer/features/workspace/components/ProxyConfigSetup';
import { mapToGlobalSettingsFormValues } from 'renderer/features/workspace/mappers';
import ControlledInput from '../Input';

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

  const { open, onClose, onCancel, defaultData } = props;

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
              API KEY <span className="optional">-{t('Optional')}</span>
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
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>();

  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });

  const onSubmit = async (data: GlobalSettingsFormValues) => {
    const dto = mapToWorkspaceConfig(data);

    await userSettingService.set(dto);
    dispatch(workbenchStoreApi(dto.APIS ?? []));
    onClose({ action: DIALOG_ACTIONS.OK });
  };

  const handleAddNewEndpoint = () => setApiDialog({ ...apiDialog, open: true, data: null });

  const form = useForm<GlobalSettingsFormValues>({
    resolver: zodResolver(globalSettingsFormSchema),
    defaultValues: async () => {
      const initialConfig = await userSettingService.get();

      return mapToGlobalSettingsFormValues(initialConfig);
    },
  });

  const { control, handleSubmit, setValue, register } = form;

  const [apiUrl, sbomLedgerToken, language, apis] = useWatch({
    name: ['apiUrl', 'sbomLedgerToken', 'language', 'apis'],
    control,
  });

  const onCloseDialogHandler = (response: DialogResponse) => {
    setApiDialog({ ...apiDialog, open: false });
    setValue('apiUrl', response.data.URL);
    setValue('apiKey', response.data.API_KEY);
    setValue('apis', [...apis, response.data]);
  };

  const handleChangeApi = (_: SyntheticEvent<Element, Event>, newValue: ApiFormValues) => {
    if (newValue?.new) {
      const value = {
        URL: newValue.URL,
        API_KEY: '',
      };
      setApiDialog({ ...apiDialog, open: true, data: value });

      return;
    }

    setValue('apiUrl', newValue?.URL || '');
    setValue('apiKey', newValue?.API_KEY || '');
  };

  const handleTrash = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, option: ApiFormValues) => {
    e.stopPropagation();

    const newApis = apis.filter((api) => api.URL !== option.URL);

    setValue('apis', newApis);
    dispatch(workbenchStoreApi(newApis));

    if (apiUrl === option.URL) {
      setValue('apiUrl', '');
      setValue('apiKey', '');
    }
  };

  return (
    <FormProvider {...form}>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="dialog-content">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS && (
                  <Stack gap={2}>
                    <Typography fontWeight="bold">{t('Title:APIConnections')}</Typography>
                    <Stack gap={0.5}>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography component="label" variant="body2" fontWeight={500}>
                          {t('Title:KnowledgebaseAPI')}
                        </Typography>
                        <Tooltip title={t('Tooltip:AddNewEndpoint')} onClick={handleAddNewEndpoint}>
                          <IconButton tabIndex={-1} color="inherit" size="small">
                            <AddIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Paper className="dialog-form-field-control">
                        <Autocomplete
                          fullWidth
                          value={apis?.find((api) => api.URL === apiUrl) || null}
                          onChange={handleChangeApi}
                          onKeyPress={(e: any) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const { value } = e.target;
                              const exists = apis.some((option) => value === option.URL);
                              if (!exists) {
                                handleChangeApi(e, { new: true, URL: value, API_KEY: '' });
                              } else {
                                setValue('apiUrl', value);
                              }
                            }
                          }}
                          filterOptions={(options, params) => {
                            const filtered = filter(options, params);

                            const { inputValue } = params;
                            // Suggest the creation of a new value
                            const exists = options.some((option) => inputValue === option.URL);

                            if (inputValue !== '' && !exists) {
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
                          options={apis || []}
                          getOptionLabel={(option) => {
                            // Value selected with enter, right from the input
                            if (typeof option === 'string') {
                              return option;
                            }

                            // Regular option
                            return `${option.URL} ${option.API_KEY ? `(${option.API_KEY})` : ''}`;
                          }}
                          renderOption={(props, option) => {
                            if (option.new) {
                              return (
                                <li {...props} className={classes.new}>
                                  {option.URL}
                                </li>
                              );
                            }

                            return (
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
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputProps={{
                                ...params.InputProps,
                              }}
                            />
                          )}
                        />
                      </Paper>
                      {AppConfig.FF_ENABLE_SETTINGS_HINT && <FormHelperText>{t('SettingsApiKeyHint')}</FormHelperText>}
                    </Stack>
                  </Stack>
                )}
              </Grid>
              <Grid item xs={12}>
                <ControlledInput
                  label={t('Title:SBOMLedgerToken')}
                  name="sbomLedgerToken"
                  control={control}
                  defaultValue={sbomLedgerToken}
                  additionalLabel={`- ${t('Optional')}`}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12}>
                <Stack gap={1}>
                  <Typography variant="body2" fontWeight={500} component="label">
                    {t('Title:Language')}
                  </Typography>
                  <Paper className="dialog-form-field-control">
                    <Select {...register('language')} size="small" fullWidth value={language || ''}>
                      {AppI18n.getLanguages().map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </Paper>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <ProxyConfigSetup />
              </Grid>
            </Grid>
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
    </FormProvider>
  );
};

export default SettingDialog;
