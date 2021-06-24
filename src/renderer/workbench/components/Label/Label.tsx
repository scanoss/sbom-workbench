import React from 'react';

interface LabelType {
  label: string | null;
  textColor: string;
}

const Label = ({ label, textColor }: LabelType) => {
  return (
    <>
      <span className={`label-boxie-${textColor}`}>{label}</span>
    </>
  );
};

export default Label;
