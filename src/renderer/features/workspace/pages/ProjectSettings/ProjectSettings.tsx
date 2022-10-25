import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Add } from '@mui/icons-material';
import { INewProject } from '@api/types';
import { userSettingService } from '@api/services/userSetting.service';
import { workspaceService } from '@api/services/workspace.service';
import { ResponseStatus } from '@api/Response';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import AppConfig from '@config/AppConfigModule';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '@mui/material/FormGroup';
import {
  selectWorkspaceState,
  setNewProject,
  setScanPath,
} from '@store/workspace-store/workspaceSlice';
import { Scanner } from '../../../../../main/task/scanner/types';
import ScannerType = Scanner.ScannerType;
import ScannerSource = Scanner.ScannerSource;

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '600px',
    },
  },
  search: {
    padding: '8px 16px 8px 8px',
    outline: 'none',
  },
  new: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.primary.light,
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
  },
}));

const ProjectSettings = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { projects, scanPath } = useSelector(selectWorkspaceState);

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [licenses, setLicenses] = useState([]);
  const [apis, setApis] = useState([]);

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
      source: ScannerSource.CODE,
      type: [
        ScannerType.CODE,
        ScannerType.DEPENDENCIES,
        ScannerType.VULNERABILITIES,
      ],
    },
  });

  const [projectValidName, setProjectValidName] = useState(false);
  const [projectNameExists, setProjectNameExists] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const data = await workspaceService.getLicenses();
    setLicenses(data);

    const apiUrlKey = await userSettingService.get();
    setApis(apiUrlKey.APIS);

    const { path } = scanPath;
    const projectName = path.split(window.path.sep)[
      path.split(window.path.sep).length - 1
    ];
    setProjectSettings({
      ...projectSettings,
      scan_root: path,
      name: projectName,
    });
  };

  useEffect(() => {
    const found = projects.find(
      (project) =>
        project.name.trim().toLowerCase() ===
        projectSettings.name.trim().toLowerCase()
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

  const onDecompress = (checked: boolean) => {
    const newType = projectSettings.scannerConfig.type.filter((t) => t !== ScannerType.UNZIP);
    if (checked) newType.push(ScannerType.UNZIP);
    setProjectSettings({
      ...projectSettings,
      scannerConfig: {
        ...projectSettings.scannerConfig,
        type: newType
      }
    })
  };

  return (
    <>
      <section id="ProjectSettings" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton
                tabIndex={-1}
                onClick={() => navigate(-1)}
                component="span"
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
              Project Settings
            </h4>
            <h1 className="mt-0 mb-0">{scanPath.path}</h1>
          </div>
        </header>
        <div className="app-content">
          <form onSubmit={(e) => handleClose(e)}>
            <div className="project-form-container mt-1">
              <div className="project-license-container">
                <div className="input-container">
                  <label className="input-label">Project Name</label>
                  <Paper className="input-text-container project-name-container">
                    <TextField
                      spellCheck={false}
                      error={projectNameExists || !projectValidName}
                      fullWidth
                      value={projectSettings.name}
                      InputProps={{ style: { fontSize: 20, fontWeight: 500 } }}
                      onChange={(e) =>
                        setProjectSettings({
                          ...projectSettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </Paper>
                  <div className="error-message">
                    {projectNameExists && 'The project name already exists '}
                    {!projectValidName && 'The project name is invalid'}
                  </div>
                </div>

                <div className="input-container input-container-license mt-1 mb-3">
                  <div className="input-label-add-container">
                    <label className="input-label">
                      License
                      <Tooltip title="Add new license">
                        <IconButton
                          tabIndex={-1}
                          color="inherit"
                          size="small"
                          onClick={openLicenseDialog}
                        >
                          <Add fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <span className="optional">- Optional</span>
                    </label>
                  </div>
                  <Paper className="input-text-container license-input-container">
                    <Autocomplete
                      size="small"
                      onChange={(e, value) =>
                        setProjectSettings({
                          ...projectSettings,
                          default_license: value?.spdxid,
                        })
                      }
                      fullWidth
                      value={
                        licenses && projectSettings.default_license
                          ? licenses?.find(
                              (license) =>
                                license?.spdxid ===
                                projectSettings?.default_license
                            )
                          : ''
                      }
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      options={licenses}
                      isOptionEqualToValue={(option: any) =>
                        option.spdxid === projectSettings.default_license
                      }
                      getOptionLabel={(option: any) =>
                        option.name || option.spdxid || ''
                      }
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <div className={classes.option}>
                            <span>{option.name}</span>
                            <span className="middle">{option.spdxid}</span>
                          </div>
                        </li>
                      )}
                      filterOptions={(options, params) => {
                        return options.filter(
                          (option) =>
                            option.name
                              .toLowerCase()
                              .includes(params.inputValue.toLowerCase()) ||
                            option.spdxid
                              .toLowerCase()
                              .includes(params.inputValue.toLowerCase())
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <SearchIcon />,
                            disableUnderline: true,
                          }}
                        />
                      )}
                    />
                  </Paper>
                </div>
              </div>
              <div className="api-conections-container mt-5">
                <div className="api-subcontainer">
                  {AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS && (
                    <>
                      <div className="api-conections-label-container mb-3">
                        <label className="input-label">API Connections</label>
                      </div>
                      <div className="label-input-container">
                        <div className="label-icon">
                          <label className="input-label h3">
                            Knowledgebase API
                            <span className="optional"> - Optional</span>
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
                              <span className="item-default">
                                Use default settings
                              </span>
                            </MenuItem>
                            ;
                            {apis.map((api) => (
                              <MenuItem value={api} key={api.key}>
                                <span>API URL: {api.URL}</span>
                                {api.API_KEY && (
                                  <span className="api_key">
                                    {' '}
                                    - API KEY: {api.API_KEY}
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
                        SBOM Ledger Token{' '}
                        <span className="optional">- Optional</span>
                      </label>
                    </div>
                    <Paper>
                      <TextField
                        size="small"
                        name="token"
                        placeholder="Use default settings"
                        fullWidth
                        onChange={(e) =>
                          setProjectSettings({
                            ...projectSettings,
                            token: e.target.value.trim(),
                          })
                        }
                      />
                    </Paper>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label className="input-label">Scanner Settings</label>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Decompress archives and scan inner files"
                    onChange={(event, checked) => onDecompress(checked)}
                  />
                </FormGroup>
                {projectSettings.scannerConfig.type.some(
                  (item) => item === ScannerType.UNZIP
                ) && (
                  <FormHelperText>
                    This option will decompress archives into project folder
                  </FormHelperText>
                )}
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
                Continue
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ProjectSettings;
