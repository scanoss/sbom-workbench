import React from 'react';

const VulnerabilitiesCard = ({ data }) => {
  return (
    <div id="VulnerabilitiesContainer">
      <div className="vulnerabilitie-container">
        <span className="vulnerabilitie-number critical-number">{data?.critical}</span>
        <span className="vulnerabilitie-label critical-label">Critical</span>
      </div>
      <div className="vulnerabilitie-container high">
        <span className="vulnerabilitie-number">{data?.high}</span>
        <span className="vulnerabilitie-label high">High</span>
      </div>
      <div className="vulnerabilitie-container medium">
        <span className="vulnerabilitie-number">{data?.medium}</span>
        <span className="vulnerabilitie-label medium">Medium</span>
      </div>
      <div className="vulnerabilitie-container moderate">
        <span className="vulnerabilitie-number">{data?.moderate}</span>
        <span className="vulnerabilitie-label moderate">Moderate</span>
      </div>
    </div>
  );
};
export default VulnerabilitiesCard;
