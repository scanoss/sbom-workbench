import React, { useContext } from 'react';
import { IconButton, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { AppContext, IAppContext } from '@context/AppProvider';

const ProjectDrop = () => {
  const navigate = useNavigate();
  const { newProject } = useContext(AppContext) as IAppContext;

  const onSelectProjectHandler = () => {
    newProject();
  };

  return <>
    <section id="ProjectScan" className="app-page">
      <header className="app-header">
        <div>
          <h4 className="header-subtitle back">
            <IconButton onClick={() => navigate(-1)} component="span" size="large">
              <ArrowBackIcon />
            </IconButton>
            New Project
          </h4>
          {/* <h1>New Project</h1> */}
        </div>
      </header>
      <main className="app-content">
        <Link onClick={onSelectProjectHandler} underline="hover">Select folder</Link>
      </main>
    </section>
  </>;
};

export default ProjectDrop;
