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
import { fileService } from '@api/services/file.service';
import { getExtension } from '@shared/utils/utils';
import { Card, useTheme, Collapse, IconButton, Snackbar, Alert } from '@mui/material';

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
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [keywordCryptoMap, setKeywordCryptoMap] = useState<Map<string,Array<string>>>(new Map());

  const loadKeywordCryptoMap = async (): Promise<void> => {
    try {
      const keywordCryptoMap = await cryptographyService.getKeywordCryptoMap();
      setKeywordCryptoMap(keywordCryptoMap);
    } catch (error: any) {
      console.error('Error loading keywordCryptoMap:', error);
    }
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false, loading: true });
      const content = await workbenchController.fetchLocalFile(`${sourceCodePath}/${path}`);
      if (content === FileType.BINARY) throw new Error(t('FileTypeNotSupported'));

      setLocalFileContent({ content, error: false, loading: false });
    } catch (error: any) {
      let content = t('FileNotLoad');
      setLocalFileContent({ content, error: true, loading: false });
    }
  };

  const copyFilePath = async () => {
    const absolutePath = await fileService.getFilePath(`${sourceCodePath}/${file}`);
    navigator.clipboard.writeText(absolutePath);
    setShowCopiedSnackbar(true);
  }

  const loadKeywords = async () => {
    const highlightKeywords = await cryptographyService.getKeyWords(cryptography);
    setKeywords(highlightKeywords);
  }

  const onHighlighted = (results: Array<HighLighted>) => {
    setHighlightResults(results);
  }

  const handleLineClick = (lineNumber: number) => {
    setScrollToLine(lineNumber);
  }

  useEffect(() => {
    if (file) {
      loadLocalFile(file);
      loadKeywords()
    }
  }, [file]);

  useEffect(() => {
    if (scrollToLine !== null) {
      // Find the app-page section (id="editor")
      const scrollContainer = document.getElementById('editor');
      if (scrollContainer) {
        // Scroll to the absolute bottom of the app-page section
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [scrollToLine]);

  useEffect(() => {
    loadKeywordCryptoMap();
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
              <h2 style={{ fontSize: '14px', fontWeight: 400, color: theme.palette.grey['600'], display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconButton disableRipple size="small" title={t('Tooltip:CopyFilePath')} onClick={copyFilePath} sx={{ borderRadius: '5px', "&:hover": { backgroundColor: "rgba(218,218,218,0.42)" } }}>
                  <i className="ri-file-copy-line" />
                </IconButton>
                {file}
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
                            {result.match}{keywordCryptoMap.get(result.match) && ` (${keywordCryptoMap.get(result.match).join(', ').toUpperCase()})`}
                          </span>
                          <span style={{ opacity: 0.6 }}>
                            {result.count} {result.count === 1 ? 'match' : 'matches'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.6 }}>
                          Lines: {result.lines.map((line, index) => (
                            <React.Fragment key={line}>
                              {index > 0 && ', '}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLineClick(line);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: theme.palette.primary.main,
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '2px',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.8';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                              >
                                {line}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            )}
          </Card>
          <div className="editor" ref={editorRef}>
            <MemoCodeViewer
              id={CodeViewerManager.CRYPTO}
              language={getExtension(file)}
              value={localFileContent?.content || ''}
              highlight={null}
              onHighlighted={onHighlighted}
              highlights={keywords || null}
              scrollToLine={scrollToLine}
              highlightMatchOptions={{
                matchCase: false,
              }}
            />
          </div>
        </main>
      </section>
      <Snackbar
        open={showCopiedSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowCopiedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopiedSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          File path copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
};

export default CryptoViewer;
