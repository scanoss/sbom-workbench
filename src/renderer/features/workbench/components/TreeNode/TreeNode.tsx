import React from 'react';
import { styled } from '@mui/material/styles';

const Root = styled('span')(({ theme }) => ({
  fontSize: 14,
  background: 'transparent',
  border: 'transparent',
  outline: 'none',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'inherit',

  '&.status-pending .icon::before': {
    background: 'var(--color-status-pending)',
  },
  '&.status-identified .icon::before': {
    background: 'var(--color-status-identified)',
  },
  '&.status-ignored .icon::before': {
    background: 'var(--color-status-ignored)',
  },
}));

const NodeIcon = styled('span')({
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
});

const NodeLabel = styled('span')({});


const TreeNode = ({ node }) => {


  return (
    <Root title={node.path} className={`node ${node.type} status-${node.status}`}>
      <NodeIcon className="icon">
         <i className="fa fa-file-o" />
      </NodeIcon>
      <NodeLabel>{node.path.split('/').pop()}</NodeLabel>
    </Root>
  );
};


export default TreeNode;
