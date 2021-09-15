import React from 'react';

const VulnerabilitiesCard = ({ data }) => {
  console.log("VUL", data)
  return (
    <div id="VulnerabilitiesContainer">
      <div className="vulnerabilitie-container">
        <span className="vulnerabilitie-number critical-number">{data?.critical}</span>
        <span className="vulnerabilitie-label critical-label">CRITICAL</span>
      </div>
      <div className="vulnerabilitie-container high">
        <span className="vulnerabilitie-number">{data?.high}</span>
        <span className="vulnerabilitie-label high">HIGH</span>
      </div>
      <div className="vulnerabilitie-container medium">
        <span className="vulnerabilitie-number">{data?.moderate}</span>
        <span className="vulnerabilitie-label moderate">MODERATE</span>
      </div>
      <div className="vulnerabilitie-container moderate">
        <span className="vulnerabilitie-number">{data?.low}</span>
        <span className="vulnerabilitie-label low">LOW</span>
      </div>
    </div>
  );
};
export default VulnerabilitiesCard;
