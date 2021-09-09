import React from 'react';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { InventoryDetail } from './pages/InventoryDetail/InventoryDetail';
import { InventoryList } from './pages/InventoryList/InventoryList';
import { IdentifiedList } from './pages/IdentifiedList/IdentifiedList';

const Identified = () => {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <IdentifiedList />
      </Route>
      <Route exact path={`${path}/inventory`}>
        <InventoryList />
      </Route>
      <Route path={`${path}/inventory/:id`}>
        <InventoryDetail />
      </Route>
    </Switch>
  );
};

export default Identified;
