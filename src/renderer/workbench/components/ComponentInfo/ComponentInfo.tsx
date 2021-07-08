import React from 'react';
import { Component } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Title from '../Title/Title';

export const ComponentInfo = ({component}: {component: Component}) => {
  return (
    <div className="component-info">
      <div>
        <Label label={component?.version} textColor="gray" />
        <Title title={component?.name} />
      </div>
      {/*<div>
        <Label label="VENDOR" textColor="gray" />
        <Title title={component?.vendor} />
      </div>
      <div>
        <Label label="VERSION" textColor="gray" />
        <Title title={component?.version} />
      </div>
      <div>
        <Label label="LICENSE" textColor="gray" />
        <Title
          title={
            component?.licenses && component.licenses[0]
              ? component?.licenses[0].name
              : '-'
          }
        />
      </div>*/}
    </div>
  );
}

export default ComponentInfo;
