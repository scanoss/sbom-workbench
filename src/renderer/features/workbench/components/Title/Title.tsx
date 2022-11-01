/* eslint-disable no-nested-ternary */
import React from 'react';

interface TitleType {
  title: string;
}

const Title = ({ title }: TitleType) => {
  return <span className="title-component-vendor">{title}</span>;
};

export default Title;
