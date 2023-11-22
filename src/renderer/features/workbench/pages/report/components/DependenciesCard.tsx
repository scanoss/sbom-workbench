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
          {data.files?.length > 0
            ? (<>found in {data.files?.length} manifest files</>)
            : (<>No manifest files found</>)}
        </span>
      </div>
    </section>
  </article>
);

export default DependenciesCard;
