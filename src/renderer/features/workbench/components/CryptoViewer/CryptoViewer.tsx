import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeViewer, { HighLighted } from '../../components/CodeViewer/CodeViewer';
import useSearchParams from '@hooks/useSearchParams';
import * as SearchUtils from '@shared/utils/search-utils';
import { workbenchController } from '../../../../controllers/workbench-controller';
import { FileType } from '@api/types';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { FileContent } from '../../pages/detected/pages/Editor/Editor';
import { CodeViewerManager } from '../../pages/detected/pages/Editor/CodeViewerManager';
import { cryptographyService } from '@api/services/cryptography.service';
import { string } from 'zod';
import { getExtension } from '@shared/utils/utils';

const CryptoViewer = () => {
  const { sourceCodePath } = useSelector(selectWorkbench);
  const { t } = useTranslation();
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [keywords, setKeywords] = useState<Array<string>>([]);
  const MemoCodeViewer = React.memo(CodeViewer);
  const cryptoParam = useSearchParams().get('crypto');
  const cryptography =  cryptoParam ? SearchUtils.unStemmifyCryptoKeywords(decodeURIComponent(cryptoParam)) : [];
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

  const loadKeywords = async () => {
    const highlightKeywords = await cryptographyService.getKeyWords(cryptography[0]);
    setKeywords(highlightKeywords);
  }

  const onHighlighted = (highlightResults: Array<HighLighted>) => {
    console.log('Highlighted terms:', highlightResults);
  }

  useEffect(() => {
    if (file) {
      console.log('Loading file:', file);
      loadLocalFile(file);
      loadKeywords()
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
          <div className="editor">
            <MemoCodeViewer
              id={CodeViewerManager.LEFT}
              language={getExtension(file)}
              value={localFileContent?.content || ''}
              highlight={null}
              onHighlighted={onHighlighted}
              highlights={keywords || null}
              highlightMatchOptions={{
                matchCase: false,
              }}
            />
          </div>
        </main>
      </section>
    </>
  );
};

export default CryptoViewer;
