/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react-hooks/exhaustive-deps */
import { Controller, useFormContext } from 'react-hook-form';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import ControlledInput from 'renderer/ui/Input';
import { dialogController } from 'renderer/controllers/dialog-controller';
import { GlobalSettingsFormValues, ProxyMode } from '../domain';

function ProxyConfigSetup() {
  const { t } = useTranslation();
  const { setValue, control, watch } = useFormContext<GlobalSettingsFormValues>();

  const proxyMode = watch('proxyConfig.mode');
  const hasNoProxy = proxyMode === ProxyMode.NoProxy;
  const isManualProxy = proxyMode === ProxyMode.Manual;
  const isAutomaticProxy = proxyMode === ProxyMode.Automatic;

  const sameConfigAsHttp = watch('proxyConfig.sameConfigAsHttp');
  const ignoreCertificateErrors = watch('proxyConfig.ignoreCertificateErrors');

  const handleSelectCertificate = async () => {
    const [path] = await dialogController.showOpenDialog({
      properties: ['openFile'],
    });

    if (!path) return;

    setValue('proxyConfig.caCertificatePath', path);
  };

  useEffect(() => {
    if (isManualProxy && sameConfigAsHttp) {
      const httpHost = watch('proxyConfig.httpHost');
      const httpPort = watch('proxyConfig.httpPort');

      setValue('proxyConfig.httpsHost', httpHost);
      setValue('proxyConfig.httpsPort', httpPort);
    }
  }, [isManualProxy, sameConfigAsHttp, watch('proxyConfig.httpHost'), watch('proxyConfig.httpPort')]);

  return (
    <>
      <Typography variant="body1" fontWeight="bold" gutterBottom>
        {t('Title:ProxySettings')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              name="proxyConfig.mode"
              onChange={(e, value) => setValue('proxyConfig.mode', value as ProxyMode)}
            >
              <FormControlLabel
                control={<Radio size="small" checked={hasNoProxy} />}
                value={ProxyMode.NoProxy}
                label={t('Title:NoProxy')}
              />
              <FormControlLabel
                control={<Radio size="small" checked={isManualProxy} />}
                value={ProxyMode.Manual}
                label={t('Title:ProxyManualConfiguration')}
              />
              {isManualProxy && (
                <Grid container columnSpacing={3} rowGap={1} sx={{ my: 1.5 }}>
                  <Grid item xs={12} md={8}>
                    <ControlledInput
                      control={control}
                      label="Title:ProxyHttp"
                      name="proxyConfig.httpHost"
                      rules={{ required: isManualProxy }}
                      placeholder="192.168.0.0.1"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ControlledInput
                      control={control}
                      label="Title:Port"
                      name="proxyConfig.httpPort"
                      rules={{ required: isManualProxy }}
                      placeholder="8080"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      control={control}
                      name="proxyConfig.sameConfigAsHttp"
                      defaultValue={!!sameConfigAsHttp}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          label={t('Title:ProxyUseSameForHttps')}
                          control={<Checkbox checked={value} onChange={onChange} size="small" />}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <ControlledInput control={control} label="Title:ProxyHttps" name="proxyConfig.httpsHost" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ControlledInput control={control} label="Title:Port" name="proxyConfig.httpsPort" type="number" />
                  </Grid>
                </Grid>
              )}
              <FormControlLabel
                control={<Radio size="small" checked={isAutomaticProxy} />}
                value={ProxyMode.Automatic}
                label={t('Title:ProxyAutoConfiguration')}
              />
              {isAutomaticProxy && (
                <ControlledInput
                  control={control}
                  label="Pac file url"
                  name="proxyConfig.automaticProxyUrl"
                  fullWidth
                  sx={{ my: 1.5 }}
                />
              )}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <ControlledInput
            control={control}
            label={t('Title:ProxyWhitelist')}
            name="proxyConfig.whitelistedHosts"
            multiline
            rows={3}
            placeholder=".mozilla.org, 192.168.1.0/24"
            helperText={
              <>
                {t('Title:ProxyWhitelistExample_one')}
                <br />
                {t('Title:ProxyWhitelistExample_other')}
              </>
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" gap={2}>
            <ControlledInput control={control} label="GRPC Proxy" name="proxyConfig.grpcProxyHost" fullWidth />
            <ControlledInput control={control} label={t('Title:Port')} name="proxyConfig.grpcProxyPort" fullWidth />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack gap={1}>
            <Stack direction="row" gap={2} alignItems="flex-end" sx={{ width: '100%' }}>
              <ControlledInput control={control} label="CA Certificate" name="proxyConfig.caCertificatePath" />
              <Button variant="contained" color="primary" onClick={handleSelectCertificate}>
                {t('Title:Browse')}
              </Button>
            </Stack>
            <Controller
              control={control}
              name="proxyConfig.ignoreCertificateErrors"
              defaultValue={!!ignoreCertificateErrors}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  label={t('Title:IgnoreCertificateErrors')}
                  control={<Checkbox checked={value} onChange={onChange} size="small" />}
                />
              )}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default ProxyConfigSetup;
