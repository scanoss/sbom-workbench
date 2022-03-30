import React, { useContext, useEffect } from 'react';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import Dependency from '../Dependency/Dependency';
import Editor from '../Editor/Editor';

enum FileType {
  code,
  dependencies,
}

const FileViewer = () => {
  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { dependencies } = state;

  const file = state.node?.type === 'file' ? state.node.path : null;
  const [fileType, setFileType] = React.useState<FileType>(null);

  useEffect(() => {
    const dep = dependencies?.filesList?.find((d) => d.file === file)?.dependenciesList;
    setFileType(dep ? FileType.dependencies : FileType.code);
  }, [file]);

  return (
    <>
      {fileType === FileType.code && <Editor />}
      {fileType === FileType.dependencies && <Dependency />}
    </>
  );
};

export default FileViewer;
