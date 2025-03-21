import React from 'react';
import { Button, ButtonGroup, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import { ClickAwayListener } from '@mui/base';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const AddProjectButton = ({ onNewProject, onImportProject, onNewProjectFromWFP, onNewProjectWithSource }) => {
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup variant="contained" ref={anchorRef} aria-label="Add new project">
        <Button startIcon={<AddIcon />} onClick={onNewProject}>
          {t('Button:NewProject')}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="Add new project"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={(e) => handleClose(e)}>
                <MenuList id="split-button-menu">
                  <MenuItem
                      onClick={(event) => {
                        setOpen(false);
                        onNewProjectFromWFP();
                      }}
                    >
                    {t('Button:NewFromWFPFile')}
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      setOpen(false);
                      onImportProject();
                    }}
                  >
                    {t('Button:ImportProject')}
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      setOpen(false);
                      onNewProjectWithSource();
                    }}
                  >
                    {t('Button:ImportProjectWithSource')}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default AddProjectButton;
