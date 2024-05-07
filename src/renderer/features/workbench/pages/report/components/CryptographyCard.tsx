import React from 'react';

const CryptographyCard = ({ data }) => (
  <article
    id="CryptographyCard"
  >
    <section>
      <div className="item mt-1">
        <span className="number">
          {data.sbom + data.local}
        </span>
        <span className="label">
          crypto algorithms detected
        </span>
      </div>
    </section>
  </article>
);

export default CryptographyCard;
