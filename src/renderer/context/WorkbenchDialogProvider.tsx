/* eslint-disable import/no-cycle */
import React, { useState } from 'react';
import { Dependency } from '../../api/types';
import DependencyDialog from '../ui/dialog/DependencyDialog';
import { DialogResponse, DIALOG_ACTIONS } from './types';

export interface IWorkbenchDialogContext {
  openDependencyDialog: (dependency: Dependency) => Promise<DialogResponse>;
}

const WorkbenchDialogContext = React.createContext<IWorkbenchDialogContext | null>(null);

export const WorkbenchDialogProvider: React.FC = ({ children }) => {
  const [dependencyDialog, setDependencyDialog] = useState<{
    open: boolean;
    dependency: Partial<Dependency>;
    onClose?: (response: DialogResponse) => void;
    onCancel?: () => void;
  }>({ open: false, dependency: {} });

  const openDependencyDialog = (dependency: Dependency): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setDependencyDialog({
        dependency,
        open: true,
        onCancel: () => {
          setDependencyDialog((dialog) => ({ ...dialog, open: false }));
          resolve({ action: DIALOG_ACTIONS.CANCEL });
        },
        onClose: (response: DialogResponse) => {
          setDependencyDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  return (
    <WorkbenchDialogContext.Provider
      value={{
        openDependencyDialog,
      }}
    >
      {children}
      <DependencyDialog
        open={dependencyDialog.open}
        dependency={dependencyDialog.dependency}
        onCancel={() => dependencyDialog.onCancel && dependencyDialog.onCancel()}
        onClose={(dep) => dependencyDialog.onClose && dependencyDialog.onClose(dep)}
      />
    </WorkbenchDialogContext.Provider>
  );
};

export default WorkbenchDialogContext;
