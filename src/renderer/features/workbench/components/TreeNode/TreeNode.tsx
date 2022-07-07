import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: 14,
    background: 'transparent',
    border: 'transparent',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',

    '&.status-pending .icon::before':  {
      background: 'var(--color-status-pending)',
    },
    '&.status-identified .icon::before':  {
      background: 'var(--color-status-identified)',
    },
    '&.status-ignored .icon::before':  {
      background: 'var(--color-status-ignored)',
    },

  },
  nodeIcon: {
    position: 'relative',
    display: 'inline-block',
    marginRight: 8,
    minWidth: 15,
    fontSize: 14,
    '&::before': {
      content: '" "',
      display: 'inline-block',
      position: 'absolute',
      left: 10,
      bottom: 1,
      background: 'transparent',
      width: 7,
      height: 7,
      borderRadius: '50%',
    },
  },
  nodeLabel: {},
}));

const TreeNode = ({ node }) => {
  const classes = useStyles();

  return (
    <span title={node.path} className={`node ${classes.root} ${node.type} status-${node.status}`}>
      <span className={`icon ${classes.nodeIcon}`}>
         <i className="fa fa-file-o" />
      </span>
      <span className={classes.nodeLabel}>{node.path.split('/').pop()}</span>
    </span>
  );
};


export default TreeNode;
