import React from 'react';

interface LabelType {
  label: string | null;
  textColor: string | null;
}

const Label = ({ label, textColor }: LabelType) => {
  return (
    <>
      <span className={`label-boxie-${textColor}`}>{label}</span>
    </>
  );
};

export default Label;
