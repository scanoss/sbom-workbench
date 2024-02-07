import React, { useRef, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Grow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { selectIsReadOnly } from '@store/workbench-store/workbenchSlice';
import { useSelector } from 'react-redux';
import useMode from '@hooks/useMode';

const ActionButton = ({
  tab,
  files,
  onIdentifyAllPressed,
  onIgnoreAllPressed,
  onDetachAllPressed,
  onRestoreAllPressed,
}) => {
  const { t } = useTranslation();
  const { props } = useMode();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      {tab === 0 && (
        <>
          <ButtonGroup
            { ...props }
            size="small"
            disabled={ props.disabled ||!files.pending || files.pending.length === 0 }
            ref={anchorRef}
            variant="contained"
            color="secondary"
          >
            <Button variant="contained" onClick={onIdentifyAllPressed}>
              {t('Button:IdentifyAllWithCount', { count: files.pending?.length})}
            </Button>
            <Button color="secondary" onClick={handleToggle}>
              <ArrowDropDownIcon fontSize="inherit" />
            </Button>
          </ButtonGroup>
          <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      <MenuItem
                        onClick={() => {
                          setOpen(false);
                          onIgnoreAllPressed();
                        }}
                      >
                        {t('Button:MarkAllAsOriginalWithCount', { count: files.pending?.length})}
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </>
      )}
      {tab === 1 && (
        <Button
          size="small"
          disabled={ props.disabled || !files.identified || files.identified.length === 0}
          variant="contained"
          color="secondary"
          onClick={onDetachAllPressed}
        >
          {t('Button:RestoreAllWithCount', { count: files.identified?.length})}
        </Button>
      )}
      {tab === 2 && (
        <Button
          size="small"
          disabled={props.disabled ||  !files.ignored || files.ignored.length === 0}
          variant="contained"
          color="secondary"
          onClick={onRestoreAllPressed}
        >
          {t('Button:RestoreAllWithCount', { count: files.ignored?.length})}
        </Button>
      )}
    </>
  );
};

export default ActionButton;
