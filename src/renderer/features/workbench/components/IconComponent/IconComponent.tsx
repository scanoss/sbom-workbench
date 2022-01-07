import React from 'react';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import { ENABLE_COMPONENT_LOGO } from '../../../../../Config';
import style from './IconComponent.scss';

const IconComponent = ({ name, size }) => {
  return (
    <div id={style.IconComponent}>
      <figure style={{ width: size, height: size }}>
        {ENABLE_COMPONENT_LOGO ? (
          <img
            alt="component logo"
            height={size}
            loading="lazy"
            style={{ backgroundImage: componentDefault }}
            src={`https://avatars.githubusercontent.com/${name}?s=${size}}`}
            onLoad={(event: any) => {
              event.target.style.backgroundImage = 'none';
            }}
            onError={(event: any) => {
              event.target.src = componentDefault;
              event.onerror = null;
            }}
          />
        ) : (
          <img alt="logo" src={componentDefault} />
        )}
      </figure>
    </div>
  );
};

export default IconComponent;
