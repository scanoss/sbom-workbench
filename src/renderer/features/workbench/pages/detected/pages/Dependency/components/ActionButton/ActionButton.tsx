import React, { useRef, useState } from 'react';
import { Button, ButtonGroup, ClickAwayListener, MenuItem, MenuList, Paper, Popper } from '@mui/material';
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
      <ButtonGroup
        size="small"
        disabled={count[0] === 0 && count[1] === 0 && count[2] === 0}
        ref={anchorRef}
        variant="contained"
        color="secondary"
      >
        <Button disabled={count[0] === 0} size="small" variant="contained" color="secondary" onClick={onAcceptAll}>
          Accept All ({count[0]})
        </Button>
        <Button color="secondary" size="small" onClick={() => setOpen(true)}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
        <Paper>
          <ClickAwayListener onClickAway={handleCloseButtonGroup}>
            <MenuList id="split-button-menu">
              <MenuItem key="test" disabled={count[1] === 0} onClick={onDismissAll}>
                Dismiss all pending ({count[1]})
              </MenuItem>
              <MenuItem key="test" disabled={count[2] === 0} onClick={onRestoreAll}>
                Restore all ({count[2]})
              </MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};

export default ActionButton;
