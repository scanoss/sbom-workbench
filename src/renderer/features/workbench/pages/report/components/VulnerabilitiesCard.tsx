import React from 'react';
import { Alert, Link } from '@mui/material';
import AppConfig from '@config/AppConfigModule';

// icons
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const VulnerabilitiesCard = ({ data, blocked }) => {
  return (
    <article id="VulnerabilitiesCard" className={blocked ? 'blocked' : 'no-blocked'}>
      <section>
        <div className="vulnerability-container critical">
          <span className="vulnerability-number">{!blocked ? data?.critical : 3}</span>
          <span className="vulnerability-label">Critical</span>
        </div>
        <div className="vulnerability-container high">
          <span className="vulnerability-number">{!blocked ? data?.high : 4}</span>
          <span className="vulnerability-label">High</span>
        </div>
        <div className="vulnerability-container medium">
          <span className="vulnerability-number">{!blocked ? data?.moderate : 23}</span>
          <span className="vulnerability-label">Moderate</span>
        </div>
        <div className="vulnerability-container low">
          <span className="vulnerability-number">{!blocked ? data?.low : 16}</span>
          <span className="vulnerability-label">Low</span>
        </div>
      </section>

      {blocked && (
        <Alert icon={<WarningAmberOutlinedIcon fontSize="inherit" />} severity="warning" className="alert mt-3">
          You need an API key to review your vulnerabilities.{' '}
          <Link color="inherit" href={`${AppConfig.SCANOSS_WEBSITE_URL}/pricing`} target="_blank" rel="noreferrer">
            Get yours now.
          </Link>
        </Alert>
      )}
    </article>
  );
};

VulnerabilitiesCard.defaultProps = { blocked: false };

export default VulnerabilitiesCard;
