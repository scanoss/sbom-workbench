import React from 'react';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import useMode from '@hooks/useMode';

const ActionButton = ({
  count,
  onAcceptAll,
  onDismissAll,
  onRestoreAll,
}: {
  count: [number, number, number];
  onAcceptAll: () => void;
  onDismissAll: () => void;
  onRestoreAll: () => void;
}) => {
  const { t } = useTranslation();
  const { props } = useMode();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonGroup
        size="small"
        disabled={props.disabled || (count[0] === 0 && count[1] === 0 && count[2] === 0)}
        variant="contained"
        color="secondary"
      >
        <Button disabled={count[0] === 0} size="small" variant="contained" color="secondary" onClick={onAcceptAll}>
          {t('Button:AcceptAllWithCount', {count: count[0]})}
        </Button>
        <Button color="secondary" size="small" onClick={handleOpen}>
          <ArrowDropDownIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem disabled={count[1] === 0} onClick={() => { handleClose(); onDismissAll();}}>
            {t('Button:DismissAllPendingWithCount', {count: count[1]})}
          </MenuItem>
          <MenuItem disabled={count[2] === 0}  onClick={() => { handleClose(); onRestoreAll();}}>
            {t('Button:RestoreAllWithCount', {count: count[2]})}
          </MenuItem>
        </Menu>
      </ButtonGroup>
    </>
  );
};

export default ActionButton;
