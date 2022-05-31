import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import DependencyViewer from '../Dependency/Dependency';
import Editor from '../Editor/Editor';

enum FileType {
  code,
  dependencies,
}

const FileViewer = () => {
  const { dependencies } = useSelector(selectWorkbench);
  const { node } = useSelector(selectNavigationState);

  const file = node?.type === 'file' ? node.path : null;
  const [fileType, setFileType] = React.useState<FileType>(null);

  useEffect(() => {
    const dep = dependencies.includes(file);
    setFileType(dep ? FileType.dependencies : FileType.code);
  }, [file]);

  return (
    <>
      {fileType === FileType.code && <Editor />}
      {fileType === FileType.dependencies && <DependencyViewer />}
    </>
  );
};

export default FileViewer;
