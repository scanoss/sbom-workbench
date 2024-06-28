import React from 'react';
import { DependencyManifestFile } from '@api/types';
import { Button, Tooltip } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import path from 'path';

interface DependencyManifestFileCardProps {
  dependencyManifestFile: DependencyManifestFile;
}

const DependencyManifestFileCard = ({ dependencyManifestFile }: DependencyManifestFileCardProps) => {
  // const dependencyName = /[^/]+$/.exec(dependencyManifestFile.path);
  const dependencyName = dependencyManifestFile.path;
  return (
    <Tooltip title={dependencyManifestFile.path} enterDelay={650}>
      <div className='dependency-card-content'>
        <section className='content'>
          <span>{dependencyName}</span>
        </section>
      </div>
    </Tooltip>
  );
};

export default DependencyManifestFileCard;
