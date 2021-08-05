import React from 'react';

const LicensesTable = ({ data, selectLicense }) => {
  const colors = ['#E8B34B', '#E22C2C', '#5754D0', '#9F69C0', '#FE7F10'];

  const getColor = () => {};

  return (
    <div className="license-list">
      {data.map((item, index) => {
        return (
          <div onClick={() => selectLicense(item.label)} key={index} className="license-list-item">
            <div style={{ backgroundColor: colors[index] }} className="license-list-item-color" />
            <div className="license-list-item-name">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default LicensesTable;
