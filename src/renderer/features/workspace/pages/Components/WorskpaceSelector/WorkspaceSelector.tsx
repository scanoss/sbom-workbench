import react, { useState } from 'react';
import { Button, Divider, Menu, MenuItem, ListItemText, styled, ListItemIcon, Chip, IconButton } from '@mui/material';
import { WorkspaceData } from '@api/types';

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


interface WorkspaceSelectorProps {
  workspaces: WorkspaceData[];
  selected?: WorkspaceData;
  onSelected?: (workspace: WorkspaceData) => void;
  onRemoved?: (workspace: WorkspaceData) => void;
  onCreated?: () => void;
}

export const WorkspaceSelector = (props: WorkspaceSelectorProps) => {
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

  const isSelected = (workspace: WorkspaceData): boolean => {
    return workspace === selected;
  }


  return (
    <div>
      <MainButton
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={<AccountCircleIcon sx={{width: 36, height: 36, }} fontSize='large' />}
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
            width: 500,
          },
        }}
      >
        {workspaces?.map((workspace) => (
          <MenuItem
            key={workspace.PATH}
            onClick={() => onItemSelected(workspace)}
            disableRipple
          >
            <ListItemText primary={workspace.NAME} secondary={workspace.PATH} />

            <div className='actions ml-5'>
              { isSelected(workspace)
                  ? <Chip label="Current" />
                  : <IconButton onClick={(e) => onItemRemoved(e, workspace)} aria-label="delete">
                      <ClearIcon fontSize='small' />
                    </IconButton>
              }
            </div>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={() => onItemNew()} disableRipple>
          <AddCircleOutlineIcon fontSize='inherit' className='mr-2' />
          Add new workspace
        </MenuItem>
      </Menu>
    </div>
  )
}
