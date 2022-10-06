import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const MenuButton = () => {
  const { t } = useTranslation();

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
        <MenuItem onClick={handleClose}>{t('APPMenu:IdentifyAllAs', { context: 'nofilter'})}</MenuItem>
        <MenuItem onClick={handleClose}>{t('APPMenu:MarkAllAsOriginal', { context: 'nofilter'})}</MenuItem>
      </Menu>
    </>
  );
};

export default MenuButton;
