import React from 'react';
import { Alert, Button, Link } from '@mui/material';
import { Trans } from 'react-i18next';
import { SettingsFileInfo } from '@api/types';
import AppConfig from '@config/AppConfigModule';

interface Props {
  visible: boolean;
  info: SettingsFileInfo;
  onReload: () => void;
  onOpenWorkRoot: () => void;
  onOpenFile: (path: string) => void;
}

const ReloadAction = ({ onReload }: { onReload: () => void }) => (
  <Button color="inherit" size="small" onClick={onReload}>
    RELOAD
  </Button>
);

const ContextFilesInfoAlert = ({
  visible, info, onReload, onOpenWorkRoot, onOpenFile,
}: Props) => {
  if (!visible) return null;

  return (
    <div className="context-files-info">
      {info.type === 'none' && (
        <Alert severity="info" action={<ReloadAction onReload={onReload} />}>
          <Trans
            i18nKey="Common:NoConfigFileFoundOptional"
            components={{
              1: <Link className="cursor-pointer" color="inherit" onClick={onOpenWorkRoot} />,
              2: <strong />,
              3: <Link href={AppConfig.SCANOSS_SETTINGS_DOCS_URL} target="_blank" rel="noopener noreferrer" color="inherit" />,
            }}
          />
        </Alert>
      )}

      {info.type === 'legacy' && (
        <Alert severity="warning" action={<ReloadAction onReload={onReload} />}>
          <Trans
            i18nKey="Common:LegacyConfigFileDetected"
            values={{ fileName: info.fileName }}
            components={{
              1: <Link className="cursor-pointer" color="inherit" onClick={() => info.fileName && onOpenFile(info.fileName)} />,
              2: <strong />,
              3: <Link href={AppConfig.SCANOSS_SETTINGS_DOCS_URL} target="_blank" rel="noopener noreferrer" color="inherit" />,
            }}
          />
        </Alert>
      )}

      {info.type === 'standard' && info.fileName && (
        <Alert severity="success" action={<ReloadAction onReload={onReload} />}>
          <Trans
            i18nKey="Common:ScanossSettingsFileFound"
            values={{ fileName: info.fileName }}
            components={{
              1: <Link className="cursor-pointer" color="inherit" onClick={() => info.fileName && onOpenFile(info.fileName)} />,
            }}
          />
        </Alert>
      )}
    </div>
  );
};

export default ContextFilesInfoAlert;
