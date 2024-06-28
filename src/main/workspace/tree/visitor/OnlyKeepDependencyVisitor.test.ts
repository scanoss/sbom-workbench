import { hasDependency, OnlyKeepDependencyVisitor } from './OnlyKeepDependencyVisitor';
import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';

describe('OnlyKeepDependencyVisitor', () => {
  let visitor: Visitor<hasDependency>;
  let root: Folder;

  beforeEach(() => {
    visitor = new OnlyKeepDependencyVisitor();
  });

  it('returns folders that contains files with the flag isDependency = true', () => {
    root = new Folder('/', '');

    const folder1 = new Folder('/src', 'src');
    const folder2 = new Folder('/src/modules', 'modules');
    const folder3 = new Folder('/src/modules/user', 'user');
    const folder4 = new Folder('/src/modules/post', 'post');

    const file1 = new File('/src/modules/user/controller.ts', 'controller.ts');
    const file2 = new File('/src/modules/post/controller.ts', 'controller.ts');
    const fileDependency = new File('/package.json', 'package.json');
    fileDependency.addDependency(fileDependency.getPath()); // Simulates this file is a dependency

    folder1.addChild(folder2);
    folder2.addChild(folder3);
    folder2.addChild(folder4);

    folder3.addChild(file1);
    folder4.addChild(file2);

    root.addChild(folder1);
    root.addChild(fileDependency);

    root.accept(visitor);

    expect(root.getChildren()).toHaveLength(1);
    expect(root.getChildren()).toContain(fileDependency);
  });
});
