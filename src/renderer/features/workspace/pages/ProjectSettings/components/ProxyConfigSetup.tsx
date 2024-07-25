import { INewProject, ProxyMode } from '@api/types';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, Paper, Radio, RadioGroup, TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  projectSettings: INewProject;
  setProjectSettings: React.Dispatch<React.SetStateAction<INewProject>>;
}

function ProxyConfigSetup({ projectSettings, setProjectSettings }: Props) {
  const { t } = useTranslation();
  const [sameConfigAsHttp, setSameConfigAsHttp] = useState(false);

  const onChangeProxyMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectSettings({
      ...projectSettings,
      proxyConfig: {
        mode: event.target.value as ProxyMode,
      },
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProjectSettings({
      ...projectSettings,
      proxyConfig: {
        ...projectSettings.proxyConfig,
        [name]: value,
      },
    });
  };

  const isManualProxy = projectSettings.proxyConfig?.mode === ProxyMode.Manual;
  const isAutomaticProxy = projectSettings.proxyConfig?.mode === ProxyMode.Automatic;

  useEffect(() => {
    if (isManualProxy && sameConfigAsHttp) {
      setProjectSettings({
        ...projectSettings,
        proxyConfig: {
          ...projectSettings.proxyConfig,
          httpsHost: projectSettings.proxyConfig?.httpHost ?? '',
          httpsPort: projectSettings.proxyConfig?.httpPort ?? '',
        },
      });
    }
  }, [isManualProxy, sameConfigAsHttp, projectSettings.proxyConfig?.httpHost, projectSettings.proxyConfig?.httpPort]);

  return (
    <FormControl component="fieldset">
      <label className="input-label">{t('Title:ProxySettings')}</label>
      <RadioGroup name="proxyMode" className="ml-3" onChange={(e) => onChangeProxyMode(e)}>
        <FormControlLabel control={<Radio size="small" />} value={ProxyMode.Manual} label={t('Title:ProxyManualConfiguration')} />
        {isManualProxy && (
          <Grid container columnSpacing={3} rowGap={1} sx={{ my: 1.5 }}>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} alignItems="center">
                <label style={{ textWrap: 'nowrap' }}>{t('Title:ProxyHttp')}</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    name="httpHost"
                    onChange={(e) => handleChange(e)}
                    placeholder="183.87.158.141"
                    required={isManualProxy}
                    size="small"
                    value={projectSettings.proxyConfig?.httpHost ?? ''}
                  />
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={2} alignItems="center">
                <label>{t('Title:Port')}</label>
                <Paper>
                  <TextField
                    fullWidth
                    name="httpPort"
                    onChange={(e) => handleChange(e)}
                    placeholder="8080"
                    required={isManualProxy}
                    size="small"
                    value={projectSettings.proxyConfig?.httpPort ?? ''}
                  />
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={sameConfigAsHttp}
                    onClick={() => {
                      setSameConfigAsHttp(!sameConfigAsHttp);
                    }}
                  />
                }
                label={t('Title:ProxyUseSameForHttps')}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} alignItems="center">
                <label style={{ textWrap: 'nowrap' }}>{t('Title:ProxyHttps')}</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField fullWidth name="httpsHost" onChange={(e) => handleChange(e)} size="small" value={projectSettings.proxyConfig?.httpsHost ?? ''} />
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={2} alignItems="center">
                <label>{t('Title:Port')}</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField fullWidth name="httpsPort" onChange={(e) => handleChange(e)} size="small" value={projectSettings.proxyConfig?.httpsPort ?? ''} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        )}
        <FormControlLabel control={<Radio size="small" />} value={ProxyMode.Automatic} label={t('Title:ProxyAutoConfiguration')} />
        {isAutomaticProxy && (
          <Grid container rowGap={2} sx={{ my: 1.5 }}>
            <Grid item xs={12}>
              <Paper sx={{ width: '100%' }}>
                <TextField fullWidth size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <label className="mb-1">{t('Title:ProxyWhitelist')}</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField fullWidth size="small" />
                </Paper>
                <FormHelperText>
                  {t('ProxyWhitelistExample_one')}
                  <br />
                  {t('ProxyWhitelistExample_other')}
                </FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        )}
      </RadioGroup>
    </FormControl>
  );
}

export default ProxyConfigSetup;
