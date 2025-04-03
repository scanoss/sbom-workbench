import React from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';


const Breadcrumb = () => {
  const navigate = useNavigate();
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
    navigate({
      pathname: '/workbench/detected',
      search: node.path ? `?path=folder|${encodeURIComponent(node.path)}` : null,
    });
  };

  return (
    <div className="view d-flex mb-3 selectable">
      <AccountTreeOutlinedIcon fontSize="inherit" className="mr-1" style={{ marginTop: '4px' }} />

      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {nodes.map((iNode, index) =>
          index < nodes.length - 1 ? (
            <Link
              key={iNode.path}
              sx={{
                cursor: 'pointer',
              }}
              underline="hover"
              color="inherit"
              onClick={() => goToNode(iNode)}
            >
              {iNode.name}
            </Link>
          ) : (
            <Typography
              key={iNode.path}
              sx={{
                fontWeight: 600,
                color: '#27272A',
              }}
            >
              {iNode.name}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
