import { INewProject, ProxyMode } from '@api/types';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, Paper, Radio, RadioGroup, TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';

interface Props {
  projectSettings: INewProject;
  setProjectSettings: React.Dispatch<React.SetStateAction<INewProject>>;
}

function ProxyConfigSetup({ projectSettings, setProjectSettings }: Props) {
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
      <label className="input-label">Configure proxy to access the internet</label>
      <RadioGroup name="proxyMode" className="ml-3" onChange={(e) => onChangeProxyMode(e)}>
        <FormControlLabel control={<Radio size="small" />} value={ProxyMode.Manual} label="Manual proxy configuration" />
        {isManualProxy && (
          <Grid container columnSpacing={3} rowGap={1} sx={{ my: 1.5 }}>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} alignItems="center">
                <label htmlFor="httpHost" style={{ textWrap: 'nowrap' }}>
                  HTTP Proxy
                </label>
                <Paper sx={{ width: '100%' }}>
                  <TextField
                    aria-label="httpHost"
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
                <label htmlFor="httpPort">Port</label>
                <Paper>
                  <TextField
                    aria-label="httpPort"
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
                label="Also use this proxy for HTTPS"
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} alignItems="center">
                <label htmlFor="httpsHost" style={{ textWrap: 'nowrap' }}>
                  HTTPS Proxy
                </label>
                <Paper sx={{ width: '100%' }}>
                  <TextField
                    aria-label="httpsHost"
                    fullWidth
                    name="httpsHost"
                    onChange={(e) => handleChange(e)}
                    size="small"
                    value={projectSettings.proxyConfig?.httpsHost ?? ''}
                  />
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={2} alignItems="center">
                <label htmlFor="httpsPort">Port</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField
                    aria-label="httpsPort"
                    fullWidth
                    name="httpsPort"
                    onChange={(e) => handleChange(e)}
                    size="small"
                    value={projectSettings.proxyConfig?.httpsPort ?? ''}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        )}
        <FormControlLabel control={<Radio size="small" />} value={ProxyMode.Automatic} label="Automatic proxy configuration url" />
        {isAutomaticProxy && (
          <Grid container rowGap={2} sx={{ my: 1.5 }}>
            <Grid item xs={12}>
              <Paper sx={{ width: '100%' }}>
                <TextField fullWidth size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <label className="mb-1">No proxy for</label>
                <Paper sx={{ width: '100%' }}>
                  <TextField fullWidth size="small" />
                </Paper>
                <FormHelperText>
                  Example: .mozilla.org, .net.nz, 192.168.1.0/24
                  <br />
                  Connections to localhost, 127.0.0.1/8 and ::1 are never proxied.
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
