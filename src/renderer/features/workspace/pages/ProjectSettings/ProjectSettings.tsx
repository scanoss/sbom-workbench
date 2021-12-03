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
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
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
  const history = useHistory();
  const { scanPath } = useContext<IAppContext>(AppContext);
  const [selectedApi, setSelectedApi] = useState(null);
  const [apis, setApis] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);
  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });

  const classes = useStyles();

  const submit = async () => {
    const config: Partial<IWorkspaceCfg> = {
      DEFAULT_API_INDEX: selectedApi
        ? apis.findIndex((api) => api === selectedApi)
        : -1,
      APIS: apis,
      TOKEN: sbomLedgerToken || null,
    };

    await userSettingService.set(config);
    // onClose({ action: DIALOG_ACTIONS.OK });
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    const { DEFAULT_API_INDEX, APIS, TOKEN } = config;

    const urlsDefault = APIS || [];
    const selectedUrlDefault =
      APIS && APIS[DEFAULT_API_INDEX] ? APIS[DEFAULT_API_INDEX] : null;

    setSbomLedgerToken(TOKEN);
    setApis(urlsDefault);
    setSelectedApi(selectedUrlDefault);
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
          <div className="project-form-container">
            <div className="project-license-container">
              <div className="input-container">
                <label className="input-label">Project Name</label>
                <Paper className="input-text-container project-name-container">
                  <InputBase
                    className="input-text project-name-input"
                    name="aa"
                    fullWidth
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Paper>
              </div>
              <div className="input-container input-container-license ">
                <div className="input-label-add-container">
                  <label className="input-label">License</label>
                  <Tooltip title="Add new license">
                    <IconButton color="inherit" size="small">
                      <AddIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </div>
                <Paper className="input-text-container license-input-container">
                  <SearchIcon className="icon" />
                  <InputBase
                    name=""
                    fullWidth
                    placeholder="License placeholder"
                  />
                </Paper>
              </div>
            </div>
            <div className="api-conections-container">
              <form
                onSubmit={handleClose}
                className="api-conections-container-form"
              >
                <div className="api-conections-label-container">
                  <label className="api-conections-label">
                    <b>API Connections</b>
                  </label>
                </div>
                <div className="label-input-container">
                  <div className="label-icon">
                    <label>Knowledgebase API</label>
                    <Tooltip
                      title="Add new endpoint"
                      onClick={onNewEndpointHandler}
                    >
                      <IconButton color="inherit" size="small">
                        <AddIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Paper className="input-text-container">
                    <Select
                      value={selectedApi}
                      onChange={handleOnChange}
                      fullWidth
                      disableUnderline
                      className={classes.search}
                      placeholder="URL"
                      style={{'padding': '8px'}}
                      onKeyPress={(e: any) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const { value } = e.target;
                          const isExisting = apis.some(
                            (option) => value === option.URL
                          );
                          if (!isExisting) {
                            handleOnChange(e, {
                              new: true,
                              inputValue: value,
                            });
                          } else {
                            setSelectedApi({ URL: value });
                          }
                        }
                      }}
                      // filterOptions={(options, params) => {
                      //   const filtered = filter(options, params);

                      //   const { inputValue } = params;
                      //   // Suggest the creation of a new value
                      //   const isExisting = options.some(
                      //     (option) => inputValue === option.URL
                      //   );
                      //   if (inputValue !== '' && !isExisting) {
                      //     filtered.push({
                      //       inputValue,
                      //       new: true,
                      //       URL: `Click or enter to add "${inputValue}"`,
                      //     });
                      //   }

                      //   return filtered;
                      // }}
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
                        return `${option.URL} ${
                          option.API_KEY ? `(${option.API_KEY})` : ''
                        }`;
                      }}
                      renderOption={(option, props) =>
                        option.new ? (
                          <li {...props} className={classes.new}>
                            {option.URL}
                          </li>
                        ) : (
                          <li
                            {...props}
                            className="w-100 d-flex space-between align-center"
                          >
                            <div className={classes.option}>
                              <span>{option.URL}</span>
                              {option.API_KEY && (
                                <span className="middle">
                                  API KEY: {option.API_KEY}
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
                          </li>
                        )
                      }
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
                      style={{'padding': '8px'}}
                      value={sbomLedgerToken}
                      onChange={(e) => setSbomLedgerToken(e.target.value)}
                    />
                  </Paper>
                </div>
              </form>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default ProjectSettings;
