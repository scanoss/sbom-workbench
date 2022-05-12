import React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import { IconButton, ListItemText, Tooltip, Typography } from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import Label from '../Label/Label';
import CodeViewerManagerInstance from '../../pages/detected/pages/Editor/CodeViewerManager';

const { shell } = require('electron')


export enum ToolbarActions {
  COPY_PATH = 'copy-path',
  OPEN = 'open',
  OPEN_IN_BROWSER = 'open-in-browser',
  FIND = 'find',
}

interface FileToolbarProps {
  id: string;
  label: string | null;
  fullpath: string;
  file: string | null;
  actions?: ToolbarActions[];
}

interface IAction {
  id: ToolbarActions;
  hint: string;
  icon: any;
  run: () => void;
}

const FileToolbar = ({ id, label, fullpath, file, actions }: FileToolbarProps) => {
  const ACTIONS: IAction[] = [
    {
      id: ToolbarActions.FIND,
      hint: 'Find in file',
      icon: <FindInPageOutlinedIcon fontSize="inherit" />,
      run: () => CodeViewerManagerInstance.get(id)?.getAction('actions.find').run(),
    },
    {
      id: ToolbarActions.COPY_PATH,
      hint: 'Copy file path',
      icon: <FileCopyOutlinedIcon fontSize="inherit" />,
      run: () => navigator.clipboard.writeText(fullpath),
    },
    {
      id: ToolbarActions.OPEN,
      hint: 'Open file in folder',
      icon: <OpenInBrowserOutlinedIcon fontSize="inherit" />,
      run: () => shell.showItemInFolder(fullpath),
    },
    {
      id: ToolbarActions.OPEN_IN_BROWSER,
      hint: 'Open file in browser',
      icon: <OpenInBrowserOutlinedIcon fontSize="inherit" />,
      run: () => console.log(fullpath),
    },
  ];

  const getFileName = (path: string) => {
    if (path) {
      const parts = path.split('/');
      return parts[parts.length - 1];
    }
    return '';
  };

  return (
    <div className="label-card">
      <div className="label-card-content">
        <ListItemText primary={label} secondary={file} title={file} />

        <div className="actions d-flex">
          {ACTIONS.filter((action) => actions.includes(action.id)).map((action) => (
            <Tooltip key={action.id} title={action.hint}>
              <IconButton disableRipple size="small" className={action.id} onClick={action.run}>
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileToolbar;

FileToolbar.defaultProps = {
  actions: [ToolbarActions.COPY_PATH, ToolbarActions.OPEN, ToolbarActions.FIND],
}
