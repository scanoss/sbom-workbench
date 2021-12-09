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
}));

const ProjectSettings = () => {
  const classes = useStyles();
  const history = useHistory();
  const { scanPath } = useContext<IAppContext>(AppContext);
  // const [selectedApi, setSelectedApi] = useState(null);
  const [licenses, setLicenses] = useState(null);
  const [apis, setApis] = useState(null);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);
  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });

  const [projectSettings, setProjectSettings] = useState({
    name: '',
    scan_root: '',
    default_license: null,
    'api-key': null,
    'api-url': null,
    sbom: null,
  });

  useEffect(() => {
    init();
  }, []);

  // dos fetch license izq con lo de groh workspaceService Autocomplete

  // derecha con import { userSettingService } from '../../../api/userSetting-service'; select
  // primera opcion del select "use default settings" esta opcion deja en null api-key & api-url esta opcion por defecto
  // las demas opciones son las del servicio.

  const init = async () => {
    const { path } = scanPath;

    // -----------Autocomplete licencias ------------

    // let data = await workspaceService.getLicense();
    // setLicenses(data);

    // ----------------------------------------------

    // -----------Select APIs ------------
    // let apiUrlKey = await userSettingService.get();
    // setApis(apiUrlKey);
    // ----------------------------------------------

    setProjectSettings({
      ...projectSettings,
      scan_root: path,
    });
  };

  const submit = async () => {
    // workspaceService.createProject(projectSettings);
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  // el nombre project name por default es el root del proyecto
  // ver file separator para el nombre carpeta
  // sacar de scan section el nombre de la carpeta
  //----------------------------------------------------
  // remover las funciones de settings
  // agus me devuelve array de urls y posicion del api seteado
  // {
  //   'project_name': 'dadaad',
  //   'license': 'dasdada',
  //   'api-url': 'dadasda',
  //   'api-key': 'dasdadad',
  //   'sbom:' 'token',
  // }

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
        <main className="app-content">
          <form onSubmit={(e) => handleClose(e)}>
            <div className="project-form-container">
              <div className="project-license-container">
                <div className="input-container">
                  <label className="input-label">Project Name</label>
                  <Paper className="input-text-container project-name-container">
                    <InputBase
                      className="input-text project-name-input"
                      name="aa"
                      fullWidth
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
                    <label className="input-label">License</label>{' '}
                    <span className="optional"> - Optional</span>
                  </div>
                  <Paper className="input-text-container license-input-container">
                    <SearchIcon className="icon" />
                    <Autocomplete
                      onChange={(e) =>
                        setProjectSettings({
                          ...projectSettings,
                          'default_license': e.target.value,
                        })
                      }
                      fullWidth
                      className={classes.search}
                      placeholder="URL"
                      style={{ padding: '8px' }}
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      //put license in options
                      options={['one', 'two', 'three']}
                      renderOption={(option) => (
                        <div>
                          <span>{option}</span>
                        </div>
                      )}
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
                      onChange={(e) =>
                        setProjectSettings({
                          ...projectSettings,
                          'api-url': e.target.value,

                        })
                      }
                      fullWidth
                      disableUnderline
                      defaultValue={0}
                      className={classes.search}
                      placeholder="URL"
                      style={{ padding: '8px' }}
                    >
                      <MenuItem value={0}>Use Default Settings</MenuItem>;
                      {/* {apis.map((api) => {
                        <MenuItem value={1}>{api}</MenuItem>;
                      })} */}
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
                  <Paper className="dialog-form-field-control">
                    <InputBase
                      name="url"
                      fullWidth
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
            <div className="button-container">
              <Button type="submit" className="btn btn-continue">
                Continue
                <ArrowForwardIcon />
              </Button>
            </div>
          </form>
        </main>
      </section>
    </>
  );
};

export default ProjectSettings;
