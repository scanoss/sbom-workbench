import React from 'react';
import {Link} from "react-router-dom";

const VulnerabilitiesCard = ({ data, onDetailClick }) => {
  return (
    <article id="VulnerabilitiesCard">
      <section>
        <div className="vulnerability-container">
          <span className="vulnerability-number critical-number">{data?.critical}</span>
          <span className="vulnerability-label critical-label">CRITICAL</span>
        </div>
        <div className="vulnerability-container high">
          <span className="vulnerability-number">{data?.high}</span>
          <span className="vulnerability-label high">HIGH</span>
        </div>
        <div className="vulnerability-container medium">
          <span className="vulnerability-number">{data?.moderate}</span>
          <span className="vulnerability-label moderate">MODERATE</span>
        </div>
        <div className="vulnerability-container moderate">
          <span className="vulnerability-number">{data?.low}</span>
          <span className="vulnerability-label low">LOW</span>
        </div>
      </section>
      <Link to="../../vulnerabilities">See more details</Link>
    </article>
  );
};
export default VulnerabilitiesCard;
