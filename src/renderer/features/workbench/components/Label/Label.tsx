import { Tooltip } from '@material-ui/core';
import React from 'react';

interface LabelType {
  label: string | null;
  textColor: string | null;
  tooltip?: boolean;
}

const Label = ({ label, textColor, tooltip }: LabelType) => {
  return (
    <>
      {tooltip ? (
        <Tooltip title={label || ''}>
          <span className={`label-boxie-${textColor}`}>{label}</span>
        </Tooltip>
      ) : (
        <span className={`label-boxie-${textColor}`}>{label}</span>
      )}
    </>
  );
};

Label.defaultProps = {
  tooltip: false,
};

export default Label;
