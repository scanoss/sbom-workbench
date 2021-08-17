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
      <section className="scan-results-home">
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
      </section>
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
                Recognized
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
              Not results found with <strong>{searchQuery}</strong>
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
