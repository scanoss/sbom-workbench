import React, { useContext } from 'react';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import ComponentCard from '../ComponentCard/ComponentCard';

export const ComponentList = () => {
  const { components } = useContext(WorkbenchContext) as IWorkbenchContext;
  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <h1>Detected Components</h1>
        </header>

        <main className="app-content">
          <section className="component-list">
            {components
              ? Object.keys(components).map((key) => (
                  <>
                    <ComponentCard component={components[key]} />
                  </>
                ))
              : null}
          </section>
        </main>
      </section>
    </>
  );
};

export default ComponentList;
