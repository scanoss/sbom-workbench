import React from 'react';
import { getColor } from '../../../../../../utils/utils';

const LicensesTable = ({ data, selectLicense, matchedLicenseSelected }) => {
  return (
    <div id="LicenseTable" className="license-list">
      {data.map((item, index) => {
        return (
          <div
            onClick={() => selectLicense(item.label)}
            key={index}
            className={`license-list-item ${
              matchedLicenseSelected && matchedLicenseSelected.label === item.label ? 'license-list-item-selected' : ''
            }`}
          >
            <span style={{ backgroundColor: getColor(index) }} className="license-list-item-color" />
            <span className="license-list-item-name">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LicensesTable;
