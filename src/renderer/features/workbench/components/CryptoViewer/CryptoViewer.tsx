import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeViewer from '../../components/CodeViewer/CodeViewer';
import useSearchParams from '@hooks/useSearchParams';
import * as SearchUtils from '@shared/utils/search-utils';
import { workbenchController } from '../../../../controllers/workbench-controller';
import { FileType } from '@api/types';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { FileContent } from '../../pages/detected/pages/Editor/Editor';
import { CodeViewerManager } from '../../pages/detected/pages/Editor/CodeViewerManager';

const CryptoViewer = () => {
  const { sourceCodePath } = useSelector(selectWorkbench);
  const { t } = useTranslation();
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const MemoCodeViewer = React.memo(CodeViewer);
  const highlightParam = useSearchParams().get('highlight');
  const highlight =  highlightParam ? SearchUtils.unStemmifyCryptoKeywords(decodeURIComponent(highlightParam)) : [];
  const fileParam = useSearchParams().get('path');
  const file = fileParam ? decodeURIComponent(fileParam) : null;

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false, loading: true });
      console.log('Loading file:', `${sourceCodePath}/${path}`);
      const content = await workbenchController.fetchLocalFile(`${sourceCodePath}/${path}`);
      if (content === FileType.BINARY) throw new Error(t('FileTypeNotSupported'));

      setLocalFileContent({ content, error: false, loading: false });
    } catch (error: any) {
      let content = t('FileNotLoad');
      setLocalFileContent({ content, error: true, loading: false });
    }
  };

  useEffect(() => {
    if (file) {
      console.log('Loading file:', file);
      loadLocalFile(file);
    }
  }, [file]);

  useEffect(() => {
    console.log('file');
  },[]);

  return (
    <>
      <section id="editor" className="app-page">
        <header className="app-header">
        </header>
        <main
          className={`
            editors
            app-content`}
        >
          <MemoCodeViewer
            id={CodeViewerManager.LEFT}
            language={'js'}
            value={localFileContent?.content || ''}
            highlight={null}
            highlights={highlight || []}
          />
        </main>
      </section>
    </>
  );
};

export default CryptoViewer;
