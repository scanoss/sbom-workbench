import React from 'react';
import {
  Checkbox, FormControlLabel, FormHelperText, TextField, Tooltip,
} from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { Scanner } from '../../../../../../main/task/scanner/types';

type ScannerConfig = Scanner.ScannerConfig;

interface Props {
  scannerConfig: ScannerConfig;
  // High-level callbacks. Decompress and the pipeline-stage cascade both touch
  // the pipelineStages array, so the parent owns those — this component only
  // emits the user's intent.
  onDecompressToggle: (checked: boolean) => void;
  onRecursiveDecompressToggle: (checked: boolean) => void;
  onMaxDecompressDepthChange: (value: string) => void;
  onObfuscateToggle: (checked: boolean) => void;
  onHpsmToggle: (checked: boolean) => void;
  onAllExtensionsToggle: (checked: boolean) => void;
}

const ScannerOptions = ({
  scannerConfig,
  onDecompressToggle,
  onRecursiveDecompressToggle,
  onMaxDecompressDepthChange,
  onObfuscateToggle,
  onHpsmToggle,
  onAllExtensionsToggle,
}: Props) => {
  const { t } = useTranslation();
  const stages = scannerConfig.pipelineStages ?? [];
  const codeEnabled = stages.includes(Scanner.PipelineStage.CODE);
  const decompressEnabled = stages.includes(Scanner.PipelineStage.UNZIP);

  return (
    <div className="scanner-settings-section">
      <label className="input-label">{t('Title:ScannerSettings')}</label>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={decompressEnabled} />}
          label={t('DecompressArchivesLabel')}
          onChange={(_, checked) => onDecompressToggle(checked)}
        />
        <FormHelperText className="helper">
          {t('DecompressArchivesHint')}
        </FormHelperText>
      </FormGroup>

      <FormGroup sx={{ pl: 4, my: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>
          <Tooltip title={t('ExpandNestedArchivesHint')}>
            <FormControlLabel
              sx={{ mr: 0, '& .MuiFormControlLabel-label': { whiteSpace: 'nowrap' } }}
              control={(
                <Checkbox
                  size="small"
                  sx={{ py: 0 }}
                  disabled={!decompressEnabled}
                  checked={scannerConfig.recursiveDecompress || false}
                />
              )}
              label={t('ExpandNestedArchivesLabel')}
              onChange={(_, checked) => onRecursiveDecompressToggle(checked)}
            />
          </Tooltip>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              visibility: scannerConfig.recursiveDecompress ? 'visible' : 'hidden',
            }}
          >
            <label htmlFor="maxDecompressDepth" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              {t('MaxDecompressDepthLabel')}
            </label>
            <TextField
              id="maxDecompressDepth"
              type="number"
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              value={scannerConfig.maxDecompressDepth ?? 3}
              inputProps={{ min: 1, max: 20, style: { width: 60, paddingTop: 4, paddingBottom: 4 } }}
              onChange={(e) => onMaxDecompressDepthChange(e.target.value)}
            />
          </div>
        </div>
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              disabled={!codeEnabled}
              checked={scannerConfig.obfuscate}
            />
          )}
          label={t('ObfuscateFilePaths')}
          onChange={(_, checked) => onObfuscateToggle(checked)}
        />
        <FormHelperText className="helper">
          {t('ObfuscateFilePathsHint')}
        </FormHelperText>
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              disabled={!codeEnabled}
              checked={scannerConfig.hpsm || false}
            />
          )}
          label={t('EnableHPSM')}
          onChange={(_, checked) => onHpsmToggle(checked)}
        />
        <FormHelperText className="helper">
          {t('HPSMHint')}
        </FormHelperText>
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              disabled={!codeEnabled}
              checked={scannerConfig.allExtensions}
            />
          )}
          label={t('IncludeAllFileTypes')}
          onChange={(_, checked) => onAllExtensionsToggle(checked)}
        />
        <FormHelperText className="helper">
          {t('IncludeAllFileTypesHint')}
        </FormHelperText>
      </FormGroup>
    </div>
  );
};

export default ScannerOptions;
