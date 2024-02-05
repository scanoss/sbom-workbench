import react, { useState } from 'react';
import { Button, Divider, Menu, MenuItem, ListItemText, styled, ListItemIcon, Chip, IconButton } from '@mui/material';
import { WorkspaceData } from '@api/types';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';

/* icons */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';

/* UI */
const MainButton = styled(Button)({
  padding: '2px 4px',
  fontSize: 22,
  fontWeight: 500
});

const useStyles = makeStyles((theme) => ({
  menuItem: {
    '& .action': {
      visibility: 'hidden'
    },
    '&:hover .action, &:focus .action': {
      visibility: 'visible'
    },
  }
}));

interface WorkspaceSelectorProps {
  workspaces: WorkspaceData[];
  selected?: WorkspaceData;
  onSelected?: (workspace: WorkspaceData) => void;
  onRemoved?: (workspace: WorkspaceData) => void;
  onCreated?: () => void;
}

export const WorkspaceSelector = (props: WorkspaceSelectorProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { selected, workspaces, onSelected, onCreated, onRemoved } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onItemSelected = (workspace: WorkspaceData) => {
    handleClose();
    if (isSelected(workspace)) return;

    onSelected(workspace);
  }

  const onItemRemoved = (event: React.MouseEvent<HTMLButtonElement>, workspace: WorkspaceData) => {
    event.preventDefault();
    event.stopPropagation();
    onRemoved(workspace);
  }

  const onItemNew = () => {
    handleClose();
    onCreated()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isSelected = (workspace: WorkspaceData, index: number = -1): boolean => {
    return workspace === selected;
  }

  const isDefault = (workspace: WorkspaceData, index: number): boolean => {
    return index === 0;
  }

  const isBlocked = (workspace: WorkspaceData, index: number): boolean => {
    return isDefault(workspace, index) || isSelected(workspace, index);
  }

  return (
    <div>
      <MainButton
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disableRipple
        startIcon={<AccountCircleIcon sx={{width: 34, height: 34, }} fontSize='large' />}
        onClick={handleClick}
      >
        {selected ? selected.NAME : 'Choose your workspace'}
      </MainButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 250,
            width: 450,
          },
        }}
      >
        {workspaces?.map((workspace, index) => (
          <MenuItem
            key={workspace.PATH}
            onClick={() => onItemSelected(workspace)}
            className={classes.menuItem}
            disableRipple
          >
            <ListItemText
              title={workspace.PATH}
              primaryTypographyProps={{ style: { fontSize: 15} }}
              secondaryTypographyProps={{ style: { fontSize: 12, textOverflow: 'ellipsis', wordWrap: 'break-word', overflow: 'hidden' } }}
              primary={workspace.NAME} secondary={workspace.PATH}
            />

            <div className='actions ml-5'>
              { isBlocked(workspace, index)
                  ? (isSelected(workspace, index) ? <Chip label={t('Current')} /> : <Chip label={t('Default')} />)
                  : <IconButton size='small' className='action' onClick={(e) => onItemRemoved(e, workspace)} aria-label="delete">
                      <ClearIcon fontSize='inherit' />
                    </IconButton>
              }
            </div>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={() => onItemNew()} disableRipple>
          <AddCircleOutlineIcon fontSize='inherit' className='mr-2' />
          {t('Button:AddNewWorkspace')}
        </MenuItem>
      </Menu>
    </div>
  )
}
