import React from 'react';
import { render } from '@testing-library/react';
import toJson from 'enzyme-to-json';

import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ProjectList from '../../renderer/features/workspace/pages/Components/ProjectList';

configure({ adapter: new Adapter() });

function setup() {
  const props = {
    projects: [],
    searchQuery: '',
    onProjectClick: jest.fn(),
    onProjectDelete: jest.fn(),
    onProjectRestore: jest.fn(),
    onProjectCreate: jest.fn(),
  };

  const enzymeWrapper = shallow(<ProjectList {...props} />);

  return {
    props,
    enzymeWrapper,
  };
}
describe('ProjectList', () => {
  it('should render an empty container', () => {
    const { enzymeWrapper } = setup();
    const tree = toJson(enzymeWrapper);

    // expect(tree).toMatchSnapshot();
    expect(tree.children[0].props.className).toEqual('empty-container');
  });

  it('should render a projects table', () => {
    const { enzymeWrapper } = setup();
    enzymeWrapper.setProps({ projects: [{ name: 'test' }] });
    const tree = toJson(enzymeWrapper);

    expect(tree.children[0].children[0].props.className).toEqual('projects-table');
  });
});
