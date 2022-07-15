import React from 'react';
import { configure } from '@testing-library/react';
import renderer from 'react-test-renderer';
import ProjectList from '../../renderer/features/workspace/pages/Components/ProjectList';

const props = {
  projects: [],
  searchQuery: '',
  onProjectClick: jest.fn(),
  onProjectDelete: jest.fn(),
  onProjectRestore: jest.fn(),
  onProjectCreate: jest.fn(),
  onProjectImport: jest.fn(),
  onProjectExport: jest.fn(),
  onProjectRescan: jest.fn(),
};

describe('ProjectList', () => {
  it('should render an empty container', () => {
    const component = renderer.create(<ProjectList {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
