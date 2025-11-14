import React, { MouseEvent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  FormHelperText,
  Grid,
  IconButton, ListItem,
  MenuItem,
  Paper,
  Select,
  Stack, styled,
  Tooltip,
  Typography
} from '@mui/material';
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
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import ControlledInput from '../Input';
import { useTheme } from '@mui/material';
const filter = createFilterOptions();

const StyledSpan = styled('span')(({ theme }) => ({
  textAlign: 'center',
  verticalAlign: 'center',
  marginLeft: '5px',
  letterSpacing: 2,
  padding: '4px 3px 2px 4px',
  borderRadius: '4px',
  backgroundColor: '#eef2ff',
  fontSize: '0.6rem',
}));

interface NewEndpointDialogProps {
  open: boolean;
  defaultData: any;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
  currentApis: any[];
}

const NewEndpointDialog = (props: NewEndpointDialogProps) => {
  const { t } = useTranslation();
  const { open, onClose, onCancel, defaultData, currentApis } = props;

  const initial = {
    URL: 'https://',
    API_KEY: '',
    DESCRIPTION: '',
  };
  const [data, setData] = useState<any>(initial);
  const [urlWarning, setUrlWarning] = useState<string>('');
  const [urlExistsWarning, setUrlExistsWarning] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const onCancelAction = () =>{
    setUrlWarning('');
    setIsValid(false);
    setUrlExistsWarning('');
    onCancel();
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (data.URL.trim().length > 0) {
      let cleanedUrl = data.URL?.replace(/\/$/, '');
      let warning = '';
      // Validate and clean URL if it contains a pathname
      try {
        const url = new URL(cleanedUrl);
        if (url.pathname !== '/' && url.pathname !== '') {
          warning = `The entered URL "${cleanedUrl}" contains a pathname "${url.pathname}", which is not supported. Setting URL to "${url.origin}".`;
          console.warn(warning);
          cleanedUrl = url.origin;
        }
      } catch (error) {
        // If URL parsing fails, continue with the original value
      }

      const nData = {
        ...data,
        URL: cleanedUrl,
        warning,
      };

      onClose({ action: DIALOG_ACTIONS.OK, data: nData });
    }
  };

  const setDefaults = () => {
    setData(defaultData || initial);
    setUrlWarning('');
  };

  useEffect(setDefaults, [open]);

  // Real-time URL validation
  useEffect(() => {
    if (data.URL.trim().length === 0) {
      setUrlWarning('');
      return;
    }
    setIsValid(true);

    let url = null;
    try{
      url = new URL(data.URL);
    }catch(e){
      setIsValid(false);
      return;
    }
    setUrlExistsWarning(``);
    if(currentApis.some((api)=> api.URL === url.origin && api.API_KEY === data.API_KEY)) {
      setUrlExistsWarning(`The entered URL and API KEY already exists`);
      setIsValid(false);
      return;
    }
    try {
      if (url.pathname !== '/' && url.pathname !== '') {
        setUrlWarning(`The entered URL "${data.URL}" contains a pathname "${url.pathname}", which is not supported. The URL will be set to "${url.origin}".`);
      } else {
        setUrlWarning('');
      }
    } catch (error) {
      // Invalid URL, but don't show pathname warning
      setUrlWarning('');
    }
  }, [data.URL, data.API_KEY]);

  return (
    <Dialog
      id="NewEndpointDialog"
      maxWidth="xs"
      fullWidth
      className="dialog"
      open={open}
      onClose={onCancel}
    >
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
            {urlWarning && (
              <FormHelperText error sx={{ mt: 0.5 }}>
                {urlWarning}
              </FormHelperText>
            )}
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
          {urlExistsWarning && (
            <FormHelperText error sx={{ mt: 0.7 }}>
              {urlExistsWarning}
            </FormHelperText>
          )}
        </div>
        <DialogActions>
          <Button color="inherit" tabIndex={-1} onClick={onCancelAction}>
            {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid}>
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
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });
  const [urlWarning, setUrlWarning] = useState<string>('');

  const onSubmit = async (data: GlobalSettingsFormValues) => {
    const dto = mapToWorkspaceConfig(data);

    try {
      await userSettingService.set(dto);
      dispatch(workbenchStoreApi(dto.APIS ?? []));
      onClose({ action: DIALOG_ACTIONS.OK });
    } catch (e: any) {
      await dialogCtrl.openAlertDialog(e.message, [
        { label: 'OK', action: 'error', role: 'delete' }], { fullWidth: false });
    }
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

  const [apiUrl, apiKey, sbomLedgerToken, language, apis] = useWatch({
    name: ['apiUrl', 'apiKey', 'sbomLedgerToken', 'language', 'apis'],
    control,
  });

  const onCloseDialogHandler = (response: DialogResponse) => {
    setApiDialog({ ...apiDialog, open: false });
    setValue('apiUrl', response.data.URL);
    setValue('apiKey', response.data.API_KEY);
    setValue('apis', [...apis, response.data]);

    // Set warning if there was one
    if (response.data.warning) {
      setUrlWarning(response.data.warning);
    }
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
    const newApis = apis.filter((api) => ((api.URL !== option.URL) || (api.API_KEY !== option.API_KEY)));
    setValue('apis', newApis);
    dispatch(workbenchStoreApi(newApis));

    if (apiUrl === option.URL && apiKey === option.API_KEY) {
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
        className="dialog"
        fullWidth
        open={open}
        onClose={onCancel}
        sx={{
          '& .MuiDialog-paper': {
            width: 600,
          }
        }}
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
                          clearIcon={false}
                          fullWidth
                          value={apis?.find((api) => api.URL === apiUrl && api.API_KEY === apiKey) || null}
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
                                URL: inputValue
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
                            return `${option.URL} ${option.API_KEY ? `(${'*'.repeat(8)})` : ''}`;
                          }}
                          renderOption={(props, option) => {
                            if (option.new) {
                              return (
                                <ListItem
                                  {...props}
                                  sx={{
                                    height: '40px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    padding: '8px 16px',
                                    display: 'flex',
                                    gap: '3px',
                                    color: theme.palette.primary.light
                                  }}
                                >
                                  <p style={{ fontWeight: 'bold' }}>{t('ClickOrEnterToAddValue')}:</p>
                                  <p style={{ color: 'black' }}>'{option.URL}'</p>
                                </ListItem>
                              );
                            }

                            return (
                              <li {...props}>
                                <article className="w-100 d-flex space-between align-center">
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1,
                                      padding: 1,
                                      '& span.middle': {
                                        fontSize: '0.8rem',
                                        color: '#6c6c6e',
                                      },
                                    }}
                                  >
                                    {option.URL === AppConfig.API_URL && option.API_KEY === "" ? (
                                      <span style={{ color: '#9e9e9e' }}>{option.URL}</span>
                                    ) : (
                                      <span>{option.URL}</span>
                                    )}
                                    {option.API_KEY && (
                                      <span className="middle">API KEY:
                                        <StyledSpan>{'*'.repeat(8)}</StyledSpan>
                                      </span>
                                    )}
                                  </Box>
                                  <IconButton
                                    disabled={apis && (apis?.length <= 1  || (option.URL === AppConfig.API_URL && option.API_KEY === ""))}
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
                      {urlWarning && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                          {urlWarning}
                        </FormHelperText>
                      )}
                      {AppConfig.FF_ENABLE_SETTINGS_HINT && <FormHelperText>{t('SettingsApiKeyHint')}</FormHelperText>}
                    </Stack>
                  </Stack>
                )}
              </Grid>
              <Grid item xs={12} sx={{ display: 'block', width: '100%' }}>
                <ControlledInput
                  label={t('Title:SBOMLedgerToken')}
                  name="sbomLedgerToken"
                  control={control}
                  defaultValue={sbomLedgerToken}
                  additionalLabel={`- ${t('Optional')}`}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'block', width: '100%' }}>
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
              <Grid item xs={12} >
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
        currentApis={apis}
      />
    </FormProvider>
  );
};

export default SettingDialog;
