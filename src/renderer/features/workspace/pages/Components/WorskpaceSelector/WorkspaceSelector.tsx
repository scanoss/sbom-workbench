import react, { useState } from 'react';
import { Button, Divider, Menu, MenuItem, ListItemText, styled } from '@mui/material';

/* icons */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/* UI */
const MainButton = styled(Button)({
  padding: '2px 4px',
  fontSize: 22,
  fontWeight: 500
});


export interface IWorkspace {
  NAME: string;
  LOCATION: string;
  DESCRIPTION: string;
};

interface WorkspaceSelectorProps {
  workspaces: IWorkspace[];
  selected?: IWorkspace;
  onSelected?: (workspace: IWorkspace) => void;
  onCreated?: () => void;
}

export const WorkspaceSelector = (props: WorkspaceSelectorProps) => {
  const { selected, workspaces, onSelected, onCreated: onWorkspaceCreate } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onItemSelected = (workspace: IWorkspace) => {
    handleClose();
    onSelected(workspace);
  }

  const onItemNew = () => {
    handleClose();
    onWorkspaceCreate()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {workspaces.map((workspace) => (
          <MenuItem onClick={() => onItemSelected(workspace)} disableRipple>
            <ListItemText primary={workspace.NAME} secondary={workspace.LOCATION} />
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
