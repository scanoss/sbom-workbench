import React from 'react';

const DependenciesCard = ({ data }) => (
  <article
    id="DependenciesCard"
  >
    <section>
      <div className="item mt-1">
        <span className="number">
          {data.total || ' - '}
        </span>
        <span className="label">
          {data.files
            ? (<>dependencies found in {data.files?.length} manifest files</>)
            : (<>no manifest files found</>)}
        </span>
      </div>
    </section>
  </article>
);

export default DependenciesCard;
