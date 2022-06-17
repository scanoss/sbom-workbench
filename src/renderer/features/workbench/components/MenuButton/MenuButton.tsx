import React from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';

const MenuButton = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <i className="ri-more-line" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: -30 }}
      >
        <MenuItem onClick={handleClose}>Identify all files as</MenuItem>
        <MenuItem onClick={handleClose}>Mark all as files original</MenuItem>
      </Menu>
    </>
  );
};

export default MenuButton;
