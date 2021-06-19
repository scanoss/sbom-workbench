import React from 'react';

interface LabelType {
  label: string;
  color: string;
}

const Label = ({ label, color }: LabelType) => {
  return (
    <>
      <span className={`label-boxie-${color}`}>{label}</span>
    </>
  );
};

export default Label;
