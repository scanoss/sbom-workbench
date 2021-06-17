import React from 'react';

interface LabelType {
  label: string;
}

const Label = ({ label }: LabelType) => {
  return (
    <>
      <span className="label-boxie">{label}</span>
    </>
  );
};

export default Label;
