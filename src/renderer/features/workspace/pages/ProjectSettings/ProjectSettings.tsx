import React, { useContext } from 'react';
import { IconButton, InputBase, Paper } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { AppContext, IAppContext } from '../../../../context/AppProvider';

const ProjectSettings = () => {
  const history = useHistory();
  const { scanPath } = useContext(AppContext) as IAppContext;

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
            <div className="input-container">
                <label className="input-label">
                  Project Name
                </label>
                <Paper className="input-text">
                  <InputBase
                    name="aa"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Paper>
            </div>
            <div className="input-container">
                <label className="input-label">
                API Conections
                </label>
                <Paper className="input-text">
                  <InputBase
                    name="aa"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Paper>
            </div>
            <div className="input-container">
                <label className="input-label">
                  License
                </label>
                <Paper className="input-text">
                  <InputBase
                    name="aa"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Paper>
            </div>
            <div className="input-container">
                <label className="input-label">
                  Project Name
                </label>
                <Paper className="input-text">
                  <InputBase
                    name="aa"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Paper>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default ProjectSettings;
