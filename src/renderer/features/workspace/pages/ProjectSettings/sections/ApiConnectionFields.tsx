import React from 'react';
import { MenuItem, Paper, Select, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AppConfig from '@config/AppConfigModule';

interface ApiInfo {
  URL: string;
  API_KEY: string;
  key: string;
}

interface Props {
  apis: ApiInfo[];
  showConfigurationOptions: boolean;
  onApiSelectionChange: (selected: ApiInfo | null) => void;
  onTokenChange: (token: string) => void;
}

// The Knowledgebase API block is gated behind a feature flag + source check.
// SBOM Ledger Token always renders. Both sit under the "API Connections" title
// which itself only appears when the Knowledgebase row is visible.
const ApiConnectionFields = ({
  apis,
  showConfigurationOptions,
  onApiSelectionChange,
  onTokenChange,
}: Props) => {
  const { t } = useTranslation();
  const showKnowledgebase = AppConfig.FF_ENABLE_API_CONNECTION_SETTINGS && showConfigurationOptions;

  return (
    <div className="api-conections-container">
      {showKnowledgebase && (
        <div className="api-conections-label-container">
          <label className="input-label">{t('Title:APIConnections')}</label>
        </div>
      )}
      <div className="api-subcontainer">
        {showKnowledgebase && (
          <div className="label-input-container">
            <div className="label-icon">
              <label className="input-label h3">
                {t('Title:KnowledgebaseAPI')}
                <span className="optional">
                  {' '}
                  -
                  {' '}
                  {t('Common:Optional')}
                </span>
              </label>
            </div>
            <Paper>
              <Select
                size="small"
                onChange={(e: any) => {
                  const selected = e.target?.value === 0 ? null : (e.target?.value as ApiInfo);
                  onApiSelectionChange(selected);
                }}
                defaultValue={0}
                fullWidth
                disableUnderline
              >
                <MenuItem value={0}>
                  <span className="item-default">{t('Common:UseDefaultSettings')}</span>
                </MenuItem>
                {apis.slice(1).map((api) => (
                  <MenuItem value={api as any} key={api.key}>
                    <span>{api.URL}</span>
                    {api.API_KEY && (
                      <span className="pl-1" style={{ color: '#6c6c6e' }}>
                        {`(${('*'.repeat(8))})`}
                      </span>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </Paper>
          </div>
        )}
        <div className="label-input-container">
          <div className="label-icon">
            <label className="input-label h3">
              {t('Title:SBOMLedgerToken')}
              {' '}
              <span className="optional">
                -
                {t('Common:Optional')}
              </span>
            </label>
          </div>
          <Paper>
            <TextField
              size="small"
              name="token"
              placeholder={t('Common:UseDefaultSettings')}
              fullWidth
              onChange={(e) => onTokenChange(e.target.value.trim())}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionFields;
