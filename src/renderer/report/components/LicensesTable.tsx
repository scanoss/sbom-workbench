import React from 'react';

const LicensesTable = ({ data, selectLicense }) => {

  const getColor = (index) => {
    const colors = [
      '#E8B34B',
      '#E22C2C',
      '#5754D0',
      '#9F69C0',
      '#FE7F10',
      '#E56399',
      '#E637BF',
      '#474647',
      '#153243',
      '#2DE1C2',
      '#F05365',
      '#A2D729',
      '#3C91E6',
      '#FA824C',
      '#C94277',
      '#E56B6F',
      '#F71735',
      '#011627',
      '#724E91',
      '#7D451B',
      '#9BE564',
    ];
    if (index < colors.length) {
      return colors[index];
    }
    return colors[colors.length - 1];
  };


  return (
    <div className="license-list">
      {data.map((item, index) => {
        return (
          <div onClick={() => selectLicense(item.label)} key={index} className="license-list-item">
            <div style={{ backgroundColor: getColor(index)  }} className="license-list-item-color" />
            <div className="license-list-item-name">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default LicensesTable;
