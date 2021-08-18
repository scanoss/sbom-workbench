import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import ComponentDetail from '../ComponentDetail/ComponentDetail';
import ScanResults from '../ComponentList/components/ScanResults';
import RecognizedList from '../RecognizedList/RecognizedList';

const Dashboard = () => {
  const { path, url } = useRouteMatch();

  <>
  <ScanResults />
  <Switch>
      <Route path={`${path}/recognized/`}>
        <RecognizedList />
      </Route>
      <Route path={`${path}/component/`}>
        <ComponentDetail />
      </Route>
  </Switch>
  </>
}

export default Dashboard;
