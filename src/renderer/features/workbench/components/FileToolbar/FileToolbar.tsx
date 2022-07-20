import React from 'react';

import {IconButton, ListItemText} from "@mui/material";
import CodeViewerManagerInstance from '../../pages/detected/pages/Editor/CodeViewerManager';


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
      icon: <i className="ri-file-search-line" />,
      run: () => CodeViewerManagerInstance.get(id)?.getAction('actions.find').run(),
    },
    {
      id: ToolbarActions.COPY_PATH,
      hint: 'Copy file path',
      icon: <i className="ri-file-copy-line" />,
      run: () => navigator.clipboard.writeText(fullpath),
    },
    {
      id: ToolbarActions.OPEN,
      hint: 'Open file in folder',
      icon: <i className="ri-share-box-line" />,
      run: () => window.shell.showItemInFolder(fullpath),
    },
    {
      id: ToolbarActions.OPEN_IN_BROWSER,
      hint: 'Open file in browser',
      icon: <i className="ri-share-box-line" />,
      run: () => window.shell.openExternal(fullpath),
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
            <IconButton sx={{ borderRadius: '5px', "&:hover": { backgroundColor: "rgba(218,218,218,0.42)" } }} key={action.id} title={action.hint} disableRipple size="small" className={action.id} onClick={action.run}>
              {action.icon}
            </IconButton>
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
