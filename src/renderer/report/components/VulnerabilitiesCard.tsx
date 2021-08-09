import React from 'react';

const VulnerabilitiesCard = () => {
  return (
    <div id="VulnerabilitiesContainer">
      <div className="vulnerabilitie-container">
        <span className="vulnerabilitie-number critical-number">22</span>
        <span className="vulnerabilitie-label critical-label">Critical</span>
      </div>
      <div className="vulnerabilitie-container high">
        <span className="vulnerabilitie-number">45</span>
        <span className="vulnerabilitie-label high">High</span>
      </div>
      <div className="vulnerabilitie-container medium">
        <span className="vulnerabilitie-number">78</span>
        <span className="vulnerabilitie-label medium">Medium</span>
      </div>
      <div className="vulnerabilitie-container moderate">
        <span className="vulnerabilitie-number">152</span>
        <span className="vulnerabilitie-label moderate">Moderate</span>
      </div>
    </div>
  );
};
export default VulnerabilitiesCard;
