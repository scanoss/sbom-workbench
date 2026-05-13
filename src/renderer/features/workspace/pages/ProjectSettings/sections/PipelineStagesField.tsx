import React from 'react';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { Scanner } from '../../../../../../main/task/scanner/types';
import PipelineWarning from './PipelineWarning';

type PipelineStage = Scanner.PipelineStage;
type ScannerSource = Scanner.ScannerSource;

interface Props {
  pipelineStages: PipelineStage[];
  source: ScannerSource | undefined;
  hasApiKey: boolean;
  showPipelineMinWarning: boolean;
  vulnerabilityRequiresPrereq: boolean;
  onToggle: (stage: PipelineStage, checked: boolean) => void;
}

const PipelineStagesField = ({
  pipelineStages,
  source,
  hasApiKey,
  showPipelineMinWarning,
  vulnerabilityRequiresPrereq,
  onToggle,
}: Props) => {
  const { t } = useTranslation();
  const codeChecked = pipelineStages.includes(Scanner.PipelineStage.CODE);
  const codeDisabled = source === Scanner.ScannerSource.WFP
    || source === Scanner.ScannerSource.IMPORTED_RESULTS_RAW;

  return (
    <div>
      <label className="input-label">{t('Title:PipelineStages')}</label>
      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              checked={codeChecked}
              onChange={(_, checked) => onToggle(Scanner.PipelineStage.CODE, checked)}
              disabled={codeDisabled}
            />
          )}
          label={t('PipelineStageCode')}
        />
        <FormHelperText className="helper">
          {t('PipelineStageCodeHint')}
        </FormHelperText>
        {codeChecked && (
          <PipelineWarning inline>
            {t('PipelineStageCodeWarning')}
          </PipelineWarning>
        )}
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              checked={pipelineStages.includes(Scanner.PipelineStage.DEPENDENCIES)}
              onChange={(_, checked) => onToggle(Scanner.PipelineStage.DEPENDENCIES, checked)}
            />
          )}
          label={t('PipelineStageDependencies')}
        />
        <FormHelperText className="helper">
          {t('PipelineStageDependenciesHint')}
        </FormHelperText>
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              checked={pipelineStages.includes(Scanner.PipelineStage.VULNERABILITIES)}
              onChange={(_, checked) => onToggle(Scanner.PipelineStage.VULNERABILITIES, checked)}
            />
          )}
          label={t('PipelineStageVulnerabilities')}
        />
        <FormHelperText className="helper">
          {t('PipelineStageVulnerabilitiesHint')}
        </FormHelperText>
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              disabled={!hasApiKey}
              checked={pipelineStages.includes(Scanner.PipelineStage.CRYPTOGRAPHY)}
              onChange={(_, checked) => onToggle(Scanner.PipelineStage.CRYPTOGRAPHY, checked)}
            />
          )}
          label={t('PipelineStageCryptography')}
        />
        <FormHelperText className="helper">
          {t('PipelineStageCryptographyHint')}
        </FormHelperText>
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={(
            <Checkbox
              disabled={source !== Scanner.ScannerSource.CODE}
              checked={pipelineStages.includes(Scanner.PipelineStage.SEARCH_INDEX)}
              onChange={(_, checked) => onToggle(Scanner.PipelineStage.SEARCH_INDEX, checked)}
            />
          )}
          label={t('PipelineStageSearchIndex')}
        />
        <FormHelperText className="helper">
          {t('PipelineStageSearchIndexHint')}
        </FormHelperText>
      </FormGroup>
      {showPipelineMinWarning && (
        <PipelineWarning>{t('PipelineStageMinWarning')}</PipelineWarning>
      )}
      {vulnerabilityRequiresPrereq && (
        <PipelineWarning>{t('PipelineStageVulnerabilityAloneWarning')}</PipelineWarning>
      )}
    </div>
  );
};

export default PipelineStagesField;
