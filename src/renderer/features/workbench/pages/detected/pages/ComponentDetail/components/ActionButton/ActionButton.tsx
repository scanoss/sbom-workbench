import React, { useRef, useState } from 'react';
import { ButtonGroup, Button, Popper, Paper, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ActionButton = ({
  tab,
  files,
  onIdentifyAllPressed,
  onIgnoreAllPressed,
  onDetachAllPressed,
  onRestoreAllPressed,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleCloseButtonGroup = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      {tab === 0 && (
        <>
          <ButtonGroup
            size="small"
            disabled={files.pending.length === 0}
            ref={anchorRef}
            variant="contained"
            color="secondary"
          >
            <Button size="small" variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
              Identify All ({files.pending.length})
            </Button>
            <Button color="secondary" size="small" onClick={() => setOpen((prevOpen) => !prevOpen)}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
            <Paper>
              <ClickAwayListener onClickAway={handleCloseButtonGroup}>
                <MenuList id="split-button-menu">
                  <MenuItem
                    key="test"
                    onClick={() => {
                      setOpen(false);
                      onIgnoreAllPressed();
                    }}
                  >
                    Mark all as original ({files.pending.length})
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Popper>
        </>
      )}
      {tab === 1 && (
        <Button
          size="small"
          disabled={files.identified.length === 0}
          variant="contained"
          color="secondary"
          onClick={onDetachAllPressed}
        >
          Restore All ({files.identified.length})
        </Button>
      )}
      {tab === 2 && (
        <Button
          size="small"
          disabled={files.ignored.length === 0}
          variant="contained"
          color="secondary"
          onClick={onRestoreAllPressed}
        >
          Restore All ({files.ignored.length})
        </Button>
      )}
    </>
  );
};

export default ActionButton;
