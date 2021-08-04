import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { makeStyles } from '@material-ui/core/styles';
import { AppContext } from '../context/AppProvider';
import { workspaceService } from '../../api/workspace-service';
import { dialogController } from '../dialog-controller';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  row: {
    cursor: 'pointer',
  },
});

const Workspace = () => {
  const history = useHistory();

  const { setScanPath } = useContext<any>(AppContext);

  const [projects, setProjects] = useState<any[]>([]);

  const init = async () => {
    const { data } = await workspaceService.getAllProjects();
    setProjects(data);
  };

  const cleanup = () => {};

  const onShowScan = (path) => {
    setScanPath(path);
    history.push('/workbench');
  };

  const onNewProject = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if(projectPath) {
      setScanPath(projectPath);
      history.push('/workspace/new');
    }
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  const classes = useStyles();

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <h1 className="header-title">Projects</h1>
          <Button variant="contained" color="secondary" onClick={onNewProject}>
            New Project
          </Button>
        </header>
        <main className="app-content">
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="projects table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Files</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((row) => (
                  <TableRow hover key={row.name} className={classes.row} onClick={() => onShowScan(row.work_root)}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.files}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </main>
      </section>
    </>
  );
};

export default Workspace;
