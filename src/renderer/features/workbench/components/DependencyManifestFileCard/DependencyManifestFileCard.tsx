import React from 'react';
import { DependencyManifestFile } from '@api/types';

interface DependencyManifestFileCardProps {
  dependencyManifestFile: DependencyManifestFile;
}

const DependencyManifestFileCard = ({ dependencyManifestFile }: DependencyManifestFileCardProps) => {
  return (
    <div>{dependencyManifestFile.path}</div>
  );
};

export default DependencyManifestFileCard;
