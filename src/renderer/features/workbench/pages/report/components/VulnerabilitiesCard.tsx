import React from 'react';
import {Link} from "react-router-dom";

const VulnerabilitiesCard = ({ data, onDetailClick }) => {
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

      <Link to="../../vulnerabilities">See more detail </Link>
    </div>
  );
};
export default VulnerabilitiesCard;
