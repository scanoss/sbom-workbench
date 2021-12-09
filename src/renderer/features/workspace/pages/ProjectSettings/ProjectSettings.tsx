import React, { useContext, useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Tooltip,
  Select,
  MenuItem,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import { useHistory } from 'react-router-dom';
import { AppContext, IAppContext } from '../../../../context/AppProvider';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import { DialogResponse, DIALOG_ACTIONS } from '../../../../context/types';
import DeleteIcon from '@material-ui/icons/Delete';
import { IWorkspaceCfg } from '../../../../../api/types';
import { userSettingService } from '../../../../../api/userSetting-service';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { licenseService } from '../../../../../api/license-service';
import { workspaceService } from '../../../../../api/workspace-service';
import { appendFile } from 'original-fs';
const pathUtil = require('path');

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '600px',
    },
  },
  search: {
    padding: '8px 15px',
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
  button: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '30px',
    borderRadius: '4px',
    width: '177px',
    height: '43px',
    padding: '12px 24px',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    fontWeight: 400,
    fontSize: '24px',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

const ProjectSettings = () => {
  const classes = useStyles();
  const history = useHistory();

  const { scanPath, setSettingsNewProject } =
    useContext<IAppContext>(AppContext);
  // const [selectedApi, setSelectedApi] = useState(null);
  const [licenses, setLicenses] = useState(null);
  const [apis, setApis] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);
  // const [apiDialog, setApiDialog] = useState({
  //   open: false,
  //   data: null,
  // });
  const [apiSelected, setApiSelected] = useState({
    URL: null,
    API_KEY: null,
    DESCRIPTION: '',
  });

  const [projects, setProjects] = useState<any[] | null>([]);
  const [projectSettings, setProjectSettings] = useState({
    name: '',
    scan_root: '',
    default_license: '',
    'api-key': null,
    'api-url': null,
    sbom: null,
  });

  const [projectNameEmpty, setprojectNameEmpty] = useState(false);
  const [projectNameExists, setprojectNameExists] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let data = await workspaceService.getLicenses();
    setLicenses(data);

    let apiUrlKey = await userSettingService.get();
    setApis(apiUrlKey.APIS);

    const projects = await workspaceService.getAllProjects();
    setProjects(projects);

    const { path } = scanPath;

    let projectName = path.split(pathUtil.sep)[
      path.split(pathUtil.sep).length - 1
    ];

    setProjectSettings({
      ...projectSettings,
      scan_root: path,
      name: projectName,
    });

  };

  useEffect(() => {
    let found = projects.find(
      (project) => project.name === projectSettings.name
    );

    if (found) {
      setprojectNameExists(true);
    } else {
      setprojectNameExists(false);
    }

    if (projectSettings.name === '') {
      setprojectNameEmpty(true);
    } else {
      setprojectNameEmpty(false);
    }
  }, [projectSettings.name, projects]);

  const submit = async () => {
    setSettingsNewProject(projectSettings);
    history.push('/workspace/new/scan');
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <>
      <section id="ProjectSettings" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={() => history.goBack()} component="span">
                <ArrowBackIcon />
              </IconButton>
              Project Settings
            </h4>
            <h1 className="mt-0 mb-0">{scanPath.path}</h1>
          </div>
        </header>
        <div className='app-content'>
        <form onSubmit={(e) => handleClose(e)}>
          <div className="project-form-container">
            <div className="project-license-container">
              <div className="input-container">
                <label className="input-label">Project Name </label>
                <span className="error-message">
                  {projectNameExists ? 'The project name already exists' : ''}
                  {projectNameEmpty ? 'The project name is empty' : ''}
                </span>
                <Paper
                  className={`input-text-container project-name-container ${
                    projectNameExists || projectNameEmpty ? 'error' : ''
                  }`}
                >
                  <InputBase
                    className="project-name-input"
                    name="aa"
                    fullWidth
                    value={projectSettings.name}
                    onChange={(e) =>
                      setProjectSettings({
                        ...projectSettings,
                        name: e.target.value,
                      })
                    }
                  />
                </Paper>
              </div>
              <div className="input-container input-container-license ">
                <div className="input-label-add-container">
                  <label className="input-label">
                    License <span className="optional">- Optional</span>
                  </label>
                </div>
                <Paper className="input-text-container license-input-container">
                  <SearchIcon className="icon" />
                  <Autocomplete
                    onChange={(e, value) =>
                      setProjectSettings({
                        ...projectSettings,
                        default_license: value?.spdxid,
                      })
                    }
                    fullWidth
                    className={classes.search}
                    placeholder="URL"
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    options={licenses}
                    getOptionLabel={(option: any) => option.name || ''}
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
              </div>
            </div>
            <div className="api-conections-container">
              <div className="api-subcontainer">
                <div className="api-conections-label-container">
                  <label className="api-conections-label">
                    <b>API Connections</b>
                  </label>
                </div>
                <div className="label-input-container">
                  <div className="label-icon">
                    <label>Knowledgebase API</label>
                  </div>
                  <Paper className="input-text-container">
                    <Select
                      onChange={(e: any) => {
                        setProjectSettings({
                          ...projectSettings,
                          'api-url': e.target?.value.URL,
                          'api-key': e.target?.value.API_KEY,
                        });
                      }}
                      defaultValue={0}
                      disableUnderline
                      className={classes.search}
                      placeholder="URL"
                    >
                      <MenuItem value={0}>Use Default Settings</MenuItem>;
                      {apis.map((api) => (
                        <MenuItem value={api} key={api.key}>
                          <span>API URL: {api.URL}</span>
                          {api.API_KEY && (
                            <span className="api-key">
                              {' '}
                              - API KEY: {api.API_KEY}
                            </span>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </Paper>
                </div>
                <div className="label-input-container mt-7">
                  <div className="label-icon">
                    <label className="">
                      SBOM Ledger Token{' '}
                      <span className="optional">- Optional</span>
                    </label>
                  </div>
                  <Paper className="input-text-container">
                    <InputBase
                      name="url"
                      placeholder="URL"
                      style={{ padding: '8px' }}
                      value={sbomLedgerToken}
                      onChange={(e) =>
                        setProjectSettings({
                          ...projectSettings,
                          sbom: e.target.value,
                        })
                      }
                    />
                  </Paper>
                </div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <Button
              type="submit"
              className={classes.button}
              disabled={projectNameEmpty || projectNameExists}
            >
              Continue
              <ArrowForwardIcon />
            </Button>
          </div>
        </form>
        </div>
      </section>
    </>
  );
};

export default ProjectSettings;
