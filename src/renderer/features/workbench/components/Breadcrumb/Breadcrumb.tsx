import React, { useContext } from 'react';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { WorkbenchContext, IWorkbenchContext } from '../../store';

const useStyles = makeStyles({
  itemLink: {
    cursor: 'pointer',
  },
  current: {
    fontWeight: 600,
    color: '#27272A',
  },
});

const Breadcrumb = () => {
  const history = useHistory();
  const classes = useStyles();

  const { state, dispatch, setNode } = useContext(WorkbenchContext) as IWorkbenchContext;

  const items = state.filter.node ? state.filter.node.path.substring(1).split('/') : [];

  const nodes = [
    { name: state.name, type: 'folder', path: null },
    ...items.map((item, index) => {
      return {
        type: 'folder',
        name: item,
        path: `/${items.slice(0, index + 1).join('/')}`,
      };
    }),
  ];

  const goToNode = (node: any) => {
    history.push(`/workbench/detected`); // TODO: remove when refactor node currents is done
    setNode(node.path ? node : null);
  };

  return (
    <div className="view d-flex align-center mb-3">
      <AccountTreeOutlinedIcon fontSize="inherit" className="mr-1" />

      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {nodes.map((node, index) =>
          index < nodes.length - 1 ? (
            <Link className={classes.itemLink} underline="hover" color="inherit" onClick={() => goToNode(node)}>
              {node.name}
            </Link>
          ) : (
            <Typography key={node.path} className={classes.current}>
              {node.name}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
