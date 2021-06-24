import { Paper, Button } from '@material-ui/core';
import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';

export const ComponentDetail = () => {
  const history = useHistory();

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
          <Link to="/workbench">
            <Button size="small">BACK</Button>
          </Link>
          <h1 className="header-title">
            <span className="color-primary">{component?.name}</span> matches
          </h1>
        </header>

        <main className="app-content">
          <section className="file-list">
            {component
              ? component.files.map((file) => (
                  <Paper onClick={() => onSelectFile(file)} key={file}>
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
