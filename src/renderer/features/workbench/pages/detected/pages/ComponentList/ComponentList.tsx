import { useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useNavigate , useLocation } from 'react-router-dom';
import { Button, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectComponentState } from '@store/component-store/componentSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import { DependencyManifestFile } from '@api/types';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import { Component } from './Component';
import { Dependency } from './Dependency';
import usePagination from '@hooks/usePagination';
import SearchBox from '@components/SearchBox/SearchBox';


// Move to common module
const filterComponents = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    const identifiedAsMatch = item.identifiedAs.some((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    return name.includes(query.toLowerCase()) || identifiedAsMatch;
  });

  return result;
};

// Move to common module
const filterDependencies = (dependencies: DependencyManifestFile[], query: string) => {
  if (!dependencies) {
    return null;
  }

  if (!query) {
    return dependencies;
  }

  const result = dependencies.filter((dependency) => {
    return dependency.path.toLowerCase().includes(query.toLowerCase());
  });

  return result;
};

export const ComponentList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { limit, onScroll } = usePagination(20);
  const navigate = useNavigate();
  const location = useLocation();
  const { components } = useSelector(selectComponentState);
  const { dependencyManifestFiles } = useSelector(selectDependencyState);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filteredComponents = filterComponents(components, searchQuery);
  const filteredDependencies = filterDependencies(dependencyManifestFiles, searchQuery);
  const [ showComponentsSection, setComponentSection ] = useState<boolean>(null);
  const [ showDependencySection, setDependencySection ] = useState<boolean>(null);
  const [ fileTreeSearchPath, setFileTreeSearchPath ] = useState<string>("");


  useEffect(() => {  
    setFileTreeSearchPath(location.search);   

   }, [location]);

  useEffect(() => {
    const showComponents = (components && filteredComponents && filteredComponents.length > 0);
    setComponentSection(showComponents);
  }, [components]);

  useEffect(() => {
    const showDependencies = (dependencyManifestFiles && filteredDependencies && filteredDependencies.length > 0);
    setDependencySection(showDependencies);
  }, [dependencyManifestFiles]);


  useEffect(() => {
    if (showComponentsSection !==null && showDependencySection!=null) {     
      if(showComponentsSection){        
        navigate(`components${fileTreeSearchPath}`, { replace: true });
        return;
      }

      if(showDependencySection){
        navigate(`dependencies${fileTreeSearchPath}`, { replace: true });
        return;
      }
      
      navigate(`components${fileTreeSearchPath}`, { replace: true });
    }
  }, [fileTreeSearchPath ,showDependencySection , showComponentsSection]);

 

  // loader
  if (components === null || dependencyManifestFiles === null) {
    return (
      <Loader message="Loading components" />
    );
  }

  return (
    <div id="ComponentList">
      <section className="app-page"  onScroll={onScroll}>
        <header className="app-header">
          <Breadcrumb />
          <section className="nav">
            <NavLink to={`components${fileTreeSearchPath}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1} >
              <Tooltip
                title={'Detected Components'}             >
                <Button size="large">Components</Button>
              </Tooltip>
            </NavLink>
            <NavLink to={`dependencies${fileTreeSearchPath}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1} >
              <Tooltip
                title={'Detected Dependencies'}             >
                <Button  size="large">Dependencies</Button>
              </Tooltip>
            </NavLink>
          </section>
          <div className="search-box">
            <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="components/*" element={<Component limit={limit} components={filteredComponents} showComponentsSection={showComponentsSection}/>} />
            <Route path="dependencies/*" element={<Dependency limit={limit} dependencyManifestFiles={filteredDependencies}/>} />          
          </Routes> 
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
