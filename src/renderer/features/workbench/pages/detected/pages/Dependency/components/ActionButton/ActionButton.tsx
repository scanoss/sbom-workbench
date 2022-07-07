import React from 'react';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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
        disabled={count[0] === 0 && count[1] === 0 && count[2] === 0}
        variant="contained"
        color="secondary"
      >
        <Button disabled={count[0] === 0} size="small" variant="contained" color="secondary" onClick={onAcceptAll}>
          Accept All ({count[0]})
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
            Dismiss all pending ({count[1]})
          </MenuItem>
          <MenuItem disabled={count[2] === 0}  onClick={() => { handleClose(); onRestoreAll();}}>
            Restore all ({count[2]})
          </MenuItem>
        </Menu>
      </ButtonGroup>
    </>
  );
};

export default ActionButton;
