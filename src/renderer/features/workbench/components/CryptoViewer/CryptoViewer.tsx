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
import { Card, useTheme, Collapse, IconButton } from '@mui/material';

// Move MemoCodeViewer outside component to prevent re-creation
const MemoCodeViewer = React.memo(CodeViewer);

const CryptoViewer = () => {
  const theme = useTheme();
  const { sourceCodePath } = useSelector(selectWorkbench);
  const { t } = useTranslation();
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [keywords, setKeywords] = useState<Array<string>>([]);
  const [highlightResults, setHighlightResults] = useState<Array<HighLighted>>([]);
  const [matchesExpanded, setMatchesExpanded] = useState(true);
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

  const onHighlighted = (results: Array<HighLighted>) => {
    console.log('Highlighted terms:', results);
    setHighlightResults(results);
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

          <Card style={{ padding: '16px', marginBottom: '16px', marginTop: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px' ,fontWeight:400 ,color: theme.palette.grey['600']  }}>
                File: {file}
              </h2>
            </div>
            {/* Crypto Matches */}
            {highlightResults.length > 0 && (
              <div>
                <div
                  onClick={() => setMatchesExpanded(!matchesExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    userSelect: 'none'
                  }}
                >
                  <IconButton size="small" sx={{ padding: '4px', marginRight: '4px' }}>
                    <i className={matchesExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} style={{ fontSize: '16px' }} />
                  </IconButton>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>
                    Cryptography Matches ({highlightResults.length})
                  </h4>
                </div>
                <Collapse in={matchesExpanded}>
                  <div style={{ display: 'grid', gap: '2px', maxHeight: '160px', overflow: 'auto' }}>
                    {highlightResults.map((result) => (
                      <div
                        key={result.match}
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '8px 12px',
                          borderRadius: '3px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '500', color: theme.palette.primary.main }}>
                            {result.match}
                          </span>
                          <span style={{ opacity: 0.6 }}>
                            {result.count} {result.count === 1 ? 'match' : 'matches'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>
                          Lines: {result.lines.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            )}
          </Card>
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
