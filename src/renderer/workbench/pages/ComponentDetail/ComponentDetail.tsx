import { Paper } from '@material-ui/core';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppContext } from '../../../context/AppProvider';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext<any>(AppContext);

  const { component, setFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const onSelectFile = (file: string) => {
    setFile(file);
    history.push(`/workbench/file/${file}`);
  };

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <h4 className="header-subtitle back">
            <IconButton onClick={() => history.goBack()} component="span">
              <ArrowBackIcon />
            </IconButton>
            {scanBasePath}
          </h4>

          <h1 className="header-title">
            <span className="color-primary">{component?.name}</span> matches
          </h1>
        </header>

        <main className="app-content">
          <section className="file-list">
            {component
              ? component.files.map((file) => (
                  <Paper className="item" onClick={() => onSelectFile(file)} key={file}>
                    {file}
                  </Paper>
                ))
              : null}
          </section>
        </main>
      </section>
    </>
  );
};

export default ComponentDetail;
