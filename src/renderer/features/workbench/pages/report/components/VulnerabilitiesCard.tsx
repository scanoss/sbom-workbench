import React from 'react';

const VulnerabilitiesCard = ({ data }) => (
  <article
    id="VulnerabilitiesCard"
  >
    <section>
      <div className="vulnerability-container critical">
        <span className="vulnerability-number">
          {data?.critical}
        </span>
        <span className="vulnerability-label">Critical</span>
      </div>
      <div className="vulnerability-container high">
        <span className="vulnerability-number">
          {data?.high}
        </span>
        <span className="vulnerability-label">High</span>
      </div>
      <div className="vulnerability-container medium">
        <span className="vulnerability-number">
          {data?.medium}
        </span>
        <span className="vulnerability-label">Medium</span>
      </div>
      <div className="vulnerability-container low">
        <span className="vulnerability-number">
          {data?.low}
        </span>
        <span className="vulnerability-label">Low</span>
      </div>
    </section>
  </article>
);

export default VulnerabilitiesCard;
