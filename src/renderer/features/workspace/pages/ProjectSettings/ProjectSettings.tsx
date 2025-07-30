import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { selectWorkspaceState, setNewProject, setScanPath } from '@store/workspace-store/workspaceSlice';
import { ContextFiles, INewProject } from '@api/types';
import { userSettingService } from '@api/services/userSetting.service';
import { workspaceService } from '@api/services/workspace.service';
import { ResponseStatus } from '@api/Response';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import AppConfig from '@config/AppConfigModule';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '@mui/material/FormGroup';
import LicenseSelector from '@components/LicenseSelector/LicenseSelector';
import { Scanner } from '../../../../../main/task/scanner/types';
import ScannerSource = Scanner.ScannerSource;
import ScannerType = Scanner.ScannerType;

const ProjectSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { projects, scanPath, settings } = useSelector(selectWorkspaceState);
  const showConfigurationOptions = scanPath?.source === Scanner.ScannerSource.CODE || scanPath?.source === Scanner.ScannerSource.WFP;

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [licenses, setLicenses] = useState([]);
  const [apis, setApis] = useState([]);
  const [context, setContext] = useState<ContextFiles>(null);
  const [scanossSettingFilePath, setScanossSettingFilePath] = useState<string>(null);

  const [projectSettings, setProjectSettings] = useState<INewProject>({
    name: '',
    scan_root: '',
    default_license: '',
    api_key: null,
    api: null,
    token: null,
    source: null,
    scannerConfig: {
      mode: Scanner.ScannerMode.SCAN,
      source: scanPath?.source || ScannerSource.CODE,
      type: [
        ScannerType.CODE,
        ScannerType.DEPENDENCIES,
        ScannerType.VULNERABILITIES,
      ],
      obfuscate: false,
    },
  });

  const [projectValidName, setProjectValidName] = useState(false);
  const [projectNameExists, setProjectNameExists] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { path } = scanPath;

    const data = await workspaceService.getLicenses();
    setLicenses(data);

    const apiUrlKey = await userSettingService.get();
    setApis(apiUrlKey.APIS);

    await getContextInfo();

    let projectName: string = path.split(window.path.sep)[path.split(window.path.sep).length - 1];

    if (projectName.endsWith('.wfp')) { projectName = projectName.replace('.wfp', ''); }

    setProjectSettings({
      ...projectSettings,
      scan_root: path,
      name: projectName,
    });
  };

  useEffect(() => {
    setApis(settings.APIS);
  }, [settings]);

  const getContextInfo = async () => {
    const { path } = scanPath;
    const nContext = await workspaceService.contextFiles(path);
    setContext(nContext);
    const scanossSettingsFilePath = await workspaceService.getScanossSettingsFilePath(path);
    setScanossSettingFilePath(scanossSettingsFilePath);
  };

  const onOpenWorkRoot = () => {
    const { path } = scanPath;
    window.shell.openPath(path);
  };

  const onOpenFile = (filepath: string) => {
    const { path } = scanPath;
    const absolutePath = window.path.resolve(path, filepath);
    window.shell.openPath(absolutePath);
  };

  const onReload = () => getContextInfo();

  useEffect(() => {
    const found = projects.find(
      (project) => project.name.trim().toLowerCase()
        === projectSettings.name.trim().toLowerCase(),
    );

    // eslint-disable-next-line no-control-regex
    const re = /^[^\s^\x00-\x1f\\?*:"";<>|/.][^\x00-\x1f\\?*:"";<>|/]*[^\s^\x00-\x1f\\?*:"";<>|/.]+$/;

    if (found) {
      setProjectNameExists(true);
    } else {
      setProjectNameExists(false);
    }

    if (projectSettings.name.trim() !== '' && re.test(projectSettings.name)) {
      setProjectValidName(true);
    } else {
      setProjectValidName(false);
    }
  }, [projectSettings.name, projects]);

  const submit = async () => {
    dispatch(setScanPath({ ...scanPath, projectName: projectSettings.name }));
    dispatch(setNewProject(projectSettings));
    navigate('/workspace/new/scan');
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate(false);
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([
        ...licenses,
        {
          spdxid: response.data.spdxid,
          name: response.data.name,
        },
      ]);

      setProjectSettings({
        ...projectSettings,
        default_license: response.data.spdxid,
      });
    }
  };

  const onDecompressHandler = (checked: boolean) => {
    const newType = projectSettings.scannerConfig.type.filter((t) => t !== ScannerType.UNZIP);
    if (checked) newType.push(ScannerType.UNZIP);
    setProjectSettings({
      ...projectSettings,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        type: newType,
      },
    });
  };

  const onObfuscateHandler = (checked: boolean) => {
    setProjectSettings({
      ...projectSettings,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        obfuscate: checked,
      },
    });
  };

  const onHPSMhandler = (checked: boolean) => {
    setProjectSettings({
      ...projectSettings,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        hpsm: checked,
      },
    });
  };

  return (
    <section id="ProjectSettings" className="app-page">
      <header className="app-header">
        <div>
          <h4 className="header-subtitle back">
            <IconButton
              tabIndex={-1}
              onClick={() => navigate(-1)}
              component="span"
            >
              <ArrowBackIcon />
            </IconButton>
            <span className="text-uppercase">{t('Title:ProjectSettings')}</span>
          </h4>
          <h1 className="mt-0 mb-0">{scanPath.path}</h1>
        </div>
      </header>
      <div className="app-content">
        <form onSubmit={(e) => handleClose(e)}>
          <div className="grid-layout form-container mt-1">
            <div className="">
              <div className="project-license-container">
                <div className="input-container">
                  <label className="input-label">{t('Title:ProjectName')}</label>
                  <Paper className="input-text-container project-name-container">
                    <TextField
                      spellCheck={false}
                      error={projectNameExists || !projectValidName}
                      fullWidth
                      value={projectSettings.name}
                      InputProps={{ style: { fontSize: 20, fontWeight: 500 } }}
                      onChange={(e) => setProjectSettings({
                        ...projectSettings,
                        name: e.target.value,
                      })}
                    />
                  </Paper>
                  <div className="error-message">
                    {projectNameExists && t('Common:ProjectNameAlreadyExists')}
                    {!projectValidName && t('Common:ProjectNameInvalid')}
                  </div>
                </div>

                <div className="input-container input-container-license mt-1 mb-3">
                  <div className="input-label-add-container">
                    <label className="input-label">
                      {t('Title:License')}
                      <Tooltip title={t('Tooltip:AddNewLicense')}>
                        <IconButton tabIndex={-1} color="inherit" size="small" onClick={openLicenseDialog}>
                          <Add fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <span className="optional">
                        -
                        {' '}
                        {t('Common:Optional')}
                      </span>
                    </label>
                  </div>
                  <div className="input-text-container license-input-container">
                    <LicenseSelector
                      options={licenses}
                      disableClearable={false}
                      onChange={(e, value) => setProjectSettings({
                        ...projectSettings,
                        default_license: value?.spdxid,
                      })}
                      value={licenses?.find((item) => item.spdxid === projectSettings?.default_license) || {}}
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                    />
                  </div>
                </div>
              </div>
              <div className="api-conections-container mt-5">
                <div className="api-subcontainer">
                  {(AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS && showConfigurationOptions) && (
                    <>
                      <div className="api-conections-label-container mb-3">
                        <label className="input-label">{t('Title:APIConnections')}</label>
                      </div>
                      <div className="label-input-container">
                        <div className="label-icon">
                          <label className="input-label h3">
                            {t('Title:KnowledgebaseAPI')}
                            <span className="optional">
                              {' '}
                              -
                              {' '}
                              {t('Common:Optional')}
                            </span>
                          </label>
                        </div>
                        <Paper>
                          <Select
                            size="small"
                            onChange={(e: any) => {
                              setProjectSettings({
                                ...projectSettings,
                                api: e.target?.value.URL,
                                api_key: e.target?.value.API_KEY,
                              });
                            }}
                            defaultValue={0}
                            fullWidth
                            disableUnderline
                          >
                            <MenuItem value={0}>
                              <span className="item-default">{t('Common:UseDefaultSettings')}</span>
                            </MenuItem>
                            ;
                            {apis.slice(1).map((api) => (
                              <MenuItem value={api} key={api.key}>
                                <span>
                                  {api.URL}
                                </span>
                                {api.API_KEY && (
                                    <span className="pl-1" style={{ color: '#6c6c6e' }}>
                                      {`(${('*'.repeat(8))})`}
                                    </span>
                                )}
                              </MenuItem>
                            ))}
                          </Select>
                        </Paper>
                      </div>
                    </>
                  )}
                  <div className="label-input-container mt-5">
                    <div className="label-icon">
                      <label className="input-label h3">
                        {t('Title:SBOMLedgerToken')}
                        {' '}
                        <span className="optional">
                          -
                          {t('Common:Optional')}
                        </span>
                      </label>
                    </div>
                    <Paper>
                      <TextField
                        size="small"
                        name="token"
                        placeholder={t('Common:UseDefaultSettings')}
                        fullWidth
                        onChange={(e) => setProjectSettings({
                          ...projectSettings,
                          token: e.target.value.trim(),
                        })}
                      />
                    </Paper>
                  </div>
                </div>
              </div>
              { scanPath?.source === Scanner.ScannerSource.CODE && (
                <div className="mt-5">
                  <label className="input-label">{t('Title:ScannerSettings')}</label>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={t('DecompressArchivesLabel')}
                      onChange={(event, checked) => onDecompressHandler(checked)}
                    />
                    <FormHelperText className="helper">
                      {t('DecompressArchivesHint')}
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={t('ObfuscateFilePaths')}
                      onChange={(event, checked) => onObfuscateHandler(checked)}
                    />
                    <FormHelperText className="helper">
                      {t('ObfuscateFilePathsHint')}
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={t('EnableHPSM')}
                      onChange={(event, checked) => onHPSMhandler(checked)}
                    />
                    <FormHelperText className="helper">
                      {t('HPSMHint')}
                    </FormHelperText>
                  </FormGroup>
                </div>
              )}
            </div>
            <div className="grid-item">
              <div className="context-files-info">
                { showConfigurationOptions && !context?.identifyFile && !context?.ignoreFile && !scanossSettingFilePath && (
                  <Alert
                    severity="info"
                    action={(
                      <Button color="inherit" size="small" onClick={onReload}>
                        RELOAD
                      </Button>
                  )}
                  >
                    No context file found. You can provide one by creating an SBOM file in the <Link className="cursor-pointer" color="inherit" onClick={onOpenWorkRoot}>root of your project</Link>.
                  </Alert>
                )}

                { scanossSettingFilePath && (
                  <Alert severity="success">
                    A SCANOSS settings file was found (<Link className="cursor-pointer" color="inherit" onClick={() => onOpenFile(scanossSettingFilePath)}>{scanossSettingFilePath}</Link>). It will be used to enhance the scan results.
                  </Alert>
                )}

                { !scanossSettingFilePath && context && (context.identifyFile) && (
                  <Alert severity="success">
                    A context file was found (<Link className="cursor-pointer" color="inherit" onClick={() => onOpenFile(context.identifyFile)}>{context.identifyFile}</Link>). It will be used to enhance the scan results.
                  </Alert>
                )}

                { !scanossSettingFilePath && context && (context.ignoreFile) && (
                  <Alert severity="success">
                    An ignore file was found (<Link className="cursor-pointer" color="inherit" onClick={() => onOpenFile(context.ignoreFile)}>{context.ignoreFile}</Link>). It will be used to avoid specific  results.
                  </Alert>
                )}

                { !scanossSettingFilePath && context && context.identifyFile && context.ignoreFile && (
                  <Alert severity="warning">
                    The identified context file takes precedence over the ignore file.
                  </Alert>
                )}
              </div>
            </div>
          </div>
          <div className="button-container">
            <Button
              endIcon={<ArrowForwardIcon />}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!projectValidName || projectNameExists}
            >
              {t('Button:Continue')}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ProjectSettings;
