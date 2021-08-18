import { makeStyles, Paper, IconButton, InputBase, Button, ButtonGroup, Card } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ViewModuleRoundedIcon from '@material-ui/icons/ViewModuleRounded';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { AppContext, IAppContext } from '../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import ComponentCard from '../../components/ComponentCard/ComponentCard';
import { setComponent } from '../../actions';
import LicensesChart from '../../../report/components/LicensesChart';
import LicensesTable from '../../../report/components/LicensesTable';
import { report } from '../../../../api/report-service';
import MatchesChart from '../../../report/components/MatchesChart';
import VulnerabilitiesCard from '../../../report/components/VulnerabilitiesCard';

const LIMIT = 100;

const filter = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return result;
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 420,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export const ComponentList = () => {
  const history = useHistory();
  const classes = useStyles();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { name, components } = state;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  const [show, setShow] = useState<boolean>(true);

  const onSelectComponent = (component) => {
    history.push(`/workbench/component`);
    dispatch(setComponent(component));
  };

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
    console.log(a?.data);
  };

  useEffect(init, []);

  return (
    <>
      {show ? (
        <section className="scan-results-home">
          <div className="div-scan-title">
            <h1 className="header-title">Scan Results</h1>
          </div>
          <div className="div-charts-home">
            <Card id="licenses" className="report-item licenses">
              <div className="report-title-home">LICENSES</div>
              <div id="report-second">
                <LicensesChart data={licenses} />
                <LicensesTable
                  matchedLicenseSelected={licenses?.[0]}
                  selectLicense={(license) => onLicenseSelected(license)}
                  data={licenses}
                />
              </div>
            </Card>
            <Card className="report-item matches">
              <div className="report-title-home">MATCHES</div>
              {progress && <MatchesChart data={progress} />}
            </Card>
            <Card className="report-item vulnerabilites">
              <div className="report-title-home">VULNERABILITIES</div>
              <VulnerabilitiesCard data={vulnerabilites} />
            </Card>
          </div>
          <div className="close-button-div">
            <div onClick={() => setShow(false)} className="button-close">
              <svg width="15" height="15" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.48776 5.00008L9.85401 1.63383C10.0487 1.43914 10.0487 1.1232 9.85401 0.928203L9.07182 0.146016C8.87713 -0.0486719 8.56119 -0.0486719 8.36619 0.146016L5.00025 3.51258L1.634 0.146328C1.43932 -0.0483593 1.12338 -0.0483593 0.928379 0.146328L0.146504 0.928203C-0.0481836 1.12289 -0.0481836 1.43883 0.146504 1.63383L3.51275 5.00008L0.146504 8.36633C-0.0481836 8.56102 -0.0481836 8.87695 0.146504 9.07195L0.928692 9.85414C1.12338 10.0488 1.43932 10.0488 1.63432 9.85414L5.00025 6.48758L8.36651 9.85383C8.56119 10.0485 8.87713 10.0485 9.07213 9.85383L9.85432 9.07164C10.049 8.87695 10.049 8.56102 9.85432 8.36602L6.48776 5.00008Z"
                  fill="#71717A"
                />
              </svg>
            </div>
          </div>
        </section>
      ) : null}
      <section id="ComponentList" className="app-page">
        <header className="app-header">
          <div className="d-flex space-between align-center">
            <div>
              <h4 className="header-subtitle">{name}</h4>
              <h1 className="header-title">Detected Components</h1>
            </div>
            <ButtonGroup>
              <Button startIcon={<ViewModuleRoundedIcon />} variant="contained" color="primary">
                Detected
              </Button>
              <Button
                startIcon={<CheckCircleIcon />}
                variant="outlined"
                color="primary"
                onClick={() => history.push('/workbench/recognized')}
              >
                Identified
              </Button>
            </ButtonGroup>
          </div>

          <Paper component="form" className={classes.root}>
            <IconButton className={classes.iconButton} aria-label="menu">
              <SearchIcon />
            </IconButton>
            <InputBase
              className={classes.input}
              onKeyUp={(e: any) => setSearchQuery(e.target.value)}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>
        </header>

        <main className="app-content">
          {components && filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, LIMIT).map((component, i) => (
                <ComponentCard key={component.purl} component={component} onClick={onSelectComponent} />
              ))}
            </section>
          ) : (
            <p>
              {searchQuery ? (
                <>
                  Not results found with <strong>{searchQuery} </strong>
                </>
              ) : (
                <> Not components detected</>
              )}
            </p>
          )}

          {filterItems?.length > LIMIT && (
            <Alert className="my-5" severity="info">
              <strong>
                Showing {LIMIT} of {filterItems.length} components
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </>
  );
};

export default ComponentList;
