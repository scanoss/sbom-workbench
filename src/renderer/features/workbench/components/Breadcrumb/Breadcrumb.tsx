import React from 'react';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';

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

  const { tree } = useSelector(selectWorkbench);
  const { node } = useSelector(selectNavigationState);

  const items = node ? node.path.substring(1).split('/') : [];

  const nodes = [
    { name: tree[0].label, type: 'folder', path: null },
    ...items.map((item, index) => {
      return {
        type: 'folder',
        name: item,
        path: `/${items.slice(0, index + 1).join('/')}`,
      };
    }),
  ];

  const goToNode = (node: any) => {
    history.push({
      pathname: '/workbench/detected',
      search: node.path ? `?path=folder|${encodeURIComponent(node.path)}` : null,
    });
  };

  return (
    <div className="view d-flex mb-3">
      <AccountTreeOutlinedIcon fontSize="inherit" className="mr-1" style={{ marginTop: '4px' }} />

      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {nodes.map((iNode, index) =>
          index < nodes.length - 1 ? (
            <Link
              key={iNode.path}
              className={classes.itemLink}
              underline="hover"
              color="inherit"
              onClick={() => goToNode(iNode)}
            >
              {iNode.name}
            </Link>
          ) : (
            <Typography key={iNode.path} className={classes.current}>
              {iNode.name}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
