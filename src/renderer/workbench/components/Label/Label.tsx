import React from 'react';

interface LabelType {
  label: string | null;
  textColor: string;
  fontTamaño: string | null;
}

const Label = ({ label, textColor, fontTamaño }: LabelType) => {
  return (
    <>
      <span className={`label-boxie-${textColor}`}>{label}</span>
    </>
  );
};

export default Label;
