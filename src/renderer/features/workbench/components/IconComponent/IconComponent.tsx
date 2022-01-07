import React from 'react';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import style from './IconComponent.scss';

const IconComponent = ({ name, size }) => {
  return (
    <div id={style.IconComponent}>
      <figure style={{ width: size, height: size }}>
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
      </figure>
    </div>
  );
};

export default IconComponent;
