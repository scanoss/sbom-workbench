import React from 'react';
import { FormHelperText } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
  // `inline` uses the tighter spacing for warnings rendered directly under a
  // FormControlLabel (e.g. the PipelineStageCode warning). The default spacing
  // suits warnings rendered after a group of FormGroups (min-warning, vuln-warning).
  // eslint-disable-next-line react/require-default-props
  inline?: boolean;
}

const PipelineWarning = ({ children, inline = false }: Props) => (

  <FormHelperText
    className="helper"
    style={{
      padding: '6px',
      marginTop: inline ? '5px' : '20px',
      marginBottom: inline ? undefined : '5px',
      marginLeft: inline ? undefined : '0px',
      border: 'solid 1px #F59E0B',
      borderRadius: '4px',
      color: '#92400E',
      fontSize: '13px',
      fontWeight: 400,
      backgroundColor: '#FFF3CD',
    }}
  >
    <WarningAmber style={{ fontSize: '16px', marginRight: '4px', verticalAlign: 'text-bottom' }} />
    {children}
  </FormHelperText>
);

export default PipelineWarning;
