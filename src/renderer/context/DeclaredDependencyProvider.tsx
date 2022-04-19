import React, { useContext, useState } from 'react';
import { DIALOG_ACTIONS } from '@context/types';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { dependencyService } from '@api/services/dependency.service';
import { NewDependencyDTO } from '@api/dto';
import { Dependency } from '@api/types';

export interface IDeclaredDependencyContext {
  loading: boolean;
  accept: (params: NewDependencyDTO) => Promise<Dependency>;
  reject: (dependencyId: number) => Promise<Dependency>;
  restore: (dependencyId: number) => Promise<Dependency>;
  acceptAll: (params: any) => Promise<boolean>;
  rejectAll: (params: any) => Promise<boolean>;
}

export const DeclaredDependencyContext = React.createContext<IDeclaredDependencyContext>(null);

const DeclaredDependencyProvider: React.FC = ({ children }) => {
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const [loading, setLoading] = useState(false);

  const accept = async (params: NewDependencyDTO) => {
    setLoading(true);
    const response = await dependencyService.accept(params);
    setLoading(false);
    return response;
  };

  const reject = async (dependencyId: number) => {
    setLoading(true);
    const response = await dependencyService.reject(dependencyId);
    setLoading(false);
    return response;
  };

  const restore = async (dependencyId: number) => {
    setLoading(true);
    const response = await dependencyService.restore(dependencyId);
    setLoading(false);
    return response;
  };

  const acceptAll = async (params: any): Promise<boolean> => {
    const message = `All valid pending dependencies will be accepted.
      <div class="custom-alert mt-3">
        <div class="MuiAlert-icon"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg></div>
        <div class="MuiAlert-message">Those dependencies that lack the version or license details will not be accepted.</div>
      </div>`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Accept All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      setLoading(true);
      console.log(params);
      await dependencyService.acceptAll(params);
      setLoading(false);
      return true;
    }

    return false;
  };

  const rejectAll = async (params: any): Promise<boolean> => {
    const message = `All pending dependencies will be dismissed.`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Dismiss All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      setLoading(true);
      await dependencyService.rejectAll(params);
      setLoading(false);
      return true;
    }

    return false;
  };

  return (
    <DeclaredDependencyContext.Provider
      value={{
        accept,
        reject,
        restore,
        acceptAll,
        rejectAll,
        loading,
      }}
    >
      {children}
    </DeclaredDependencyContext.Provider>
  );
};

export default DeclaredDependencyProvider;
