import React from 'react';

const LicensesTable = ({ data, selectLicense }) => {
  return (
    <div className="license-list">
      {data.map((item, index) => {
        return (
          <div onClick={() => selectLicense(item.label)} key={index} className="license-list-item">
            <div className="license-list-item-color" />
            <div className="license-list-item-name">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default LicensesTable;
