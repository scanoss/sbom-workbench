import React, { useContext } from 'react';
import Tree, { Expandable } from 'react-virtualized-tree';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

const FileTreeVirt = () => {
  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { tree } = state;

  return (
    <Tree nodes={[tree]} onChange={(e) => console.log(e)}>
      {({ style, node, ...rest }) => (
        <div style={style}>
          <Expandable
            node={node}
            {...rest}
            iconsClassNameMap={{
              expanded: 'mi mi-folder-open',
              collapsed: 'mi mi-folder',
              lastChild: 'mi mi-insert-drive-file',
            }}
          >
            {node.name}
          </Expandable>
        </div>
      )}
    </Tree>
  );
};

export default FileTreeVirt;
