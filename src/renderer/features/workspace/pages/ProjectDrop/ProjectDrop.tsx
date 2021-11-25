import React, { useContext } from 'react';
import { IconButton, Link } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { AppContext, IAppContext } from '../../../../context/AppProvider';

const ProjectDrop = () => {
  const history = useHistory();
  const { setScanPath, newProject } = useContext(AppContext) as IAppContext;

  const onSelectProjectHandler = () => {
    newProject();
  };

  return (
    <>
      <section id="ProjectScan" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={() => history.goBack()} component="span">
                <ArrowBackIcon />
              </IconButton>
              New Project
            </h4>
            {/* <h1>New Project</h1> */}
          </div>
        </header>
        <main className="app-content">
          <Link onClick={onSelectProjectHandler}>Select folder</Link>
        </main>
      </section>
    </>
  );
};

export default ProjectDrop;
