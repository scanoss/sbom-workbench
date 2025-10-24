import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import CodeViewerManagerInstance from '../../pages/detected/pages/Editor/CodeViewerManager';

export interface HighLighted {
  match: string;
  count: number;
  lines: Array<number>;
}

export interface HighlightMatchOptions {
  matchCase?: boolean;      // Case-sensitive matching (default: true)
  matchWholeWord?: boolean;  // Match whole words only (default: false)
  isRegex?: boolean;         // Treat search term as regex (default: false)
}

interface ICodeViewerProps {
  id: string;
  value: string;
  language: string;
  highlight: string;
  scrollToLine?: number;
  highlights?: string[];
  highlightMatchOptions?: HighlightMatchOptions; // Configure match behavior
  onHighlighted?: (matchedTerms: Array<HighLighted>) => void;
  highlightHoverMessage?: (term: string, line: number) => string; // Customize hover message
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

const CodeViewer = ({ id, value, language, highlight, highlights, highlightMatchOptions, onHighlighted, highlightHoverMessage, options, scrollToLine }: ICodeViewerProps) => {
  const editor = React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const editorContainerRef = React.createRef<HTMLDivElement>();
  const scrollLineDecorations = React.useRef<string[]>([]);
  const initMonaco = () => {
    const ref = editorContainerRef.current;
    if (ref) {
      editor.current = monaco.editor.create(ref, {
        language,
        model: null,
        ...getDefaultOptions(),
        ...options,
      });

      // set editor in manager
      CodeViewerManagerInstance.set(id, editor.current);
    }
  };

  const destroyMonaco = () => {
    if (editor.current) {
      editor.current.dispose();
      CodeViewerManagerInstance.set(id, null);
    }
  };

  const getDefaultOptions = (): monaco.editor.IStandaloneEditorConstructionOptions => ({
    readOnly: true,
    automaticLayout: true,
    theme: 'vs-dark',
    fontSize: 12,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    glyphMargin: highlight && highlight !== 'all',
    overviewRulerLanes: 3, // Enable overview ruler with 3 lanes
    overviewRulerBorder: false,
    minimap: {
      enabled: true,
      showSlider: 'mouseover', // Show preview on hover
    },
  });

  const updateContent = () => {
    const { current: mEditor } = editor;

    if (mEditor) {
      const model = mEditor.getModel();
      if (model) model.dispose();

      const nModel = monaco.editor.createModel(value, language);
      mEditor.setModel(nModel);
      // mEditor.focus();
      // mEditor.layout({} as monaco.editor.IDimension);
    }
  };

  const updateHighlight = () => {
    if (editor.current) {
      if (highlight && highlight !== 'all') {
        const decorations =
          highlight
            .split(',')
            .map((range: string) => {
              const [start, end] = range.split('-').map(Number);
              return [
                {
                  range: new monaco.Range(start, 1, start, 1),
                  options: {
                    isWholeLine: true,
                  },
                },
                {
                  range: new monaco.Range(end, 1, end, 1),
                  options: {
                    isWholeLine: true,
                  },
                },
                {
                  range: new monaco.Range(start, 1, end, 1),
                  options: {
                    isWholeLine: true,
                    className: 'lineHighlightDecoration',
                    linesDecorationsClassName: 'lineRangeDecoration',

                  },
                },
              ];
            })
            .flat();
        editor.current.deltaDecorations([], decorations);

        editor.current.revealLineNearTop(decorations[0].range.startLineNumber);
      } else {
        // remove all decorations
        // editor.current.deltaDecorations([], []);
      }
    }
  };

  const highlightTerms = (terms: string[]) => {
    const { current: mEditor } = editor;
    const highlightedTerms = new Map<string, HighLighted>(); // Track which terms had matches
    try {
      const model = mEditor.getModel();

      // Default match options
      const matchOptions: HighlightMatchOptions = {
        matchCase: true,
        matchWholeWord: false,
        isRegex: false,
        ...highlightMatchOptions
      };

      const matches = terms
        .map((term) => {
          // Build the search pattern
          let searchTerm = term;
          if (matchOptions.matchWholeWord && !matchOptions.isRegex) {
            // Wrap in word boundaries for whole word matching
            searchTerm = `\\b${term}\\b`;
          }

          // Find matches with configured options
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const found = model.findMatches(
            searchTerm,
            true,  // search in full document
            matchOptions.matchWholeWord && !matchOptions.isRegex ? true : matchOptions.isRegex, // isRegex
            matchOptions.matchCase,  // matchCase
            null,  // word separators
            true   // capture matches
          );

          // Track term stats ONCE per term, before mapping through matches
          if (found.length > 0) {
            const lines = [...new Set(found.map(match => match.range.startLineNumber))];
            highlightedTerms.set(term, {
              match: term,
              count: found.length,
              lines: lines.sort((a, b) => a - b)
            });
          }

          return found.map(({ range }) => {
            // Generate hover message using custom function or default
            const hoverText = highlightHoverMessage
              ? highlightHoverMessage(term, range.startLineNumber)
              : `**Match**: \`${term}\` at line ${range.startLineNumber}`;

            return {
              range,
              options: {
                inlineClassName: 'inlineWordHighlightDecoration',
                linesDecorationsClassName: 'lineHighlightLineDecoration',
                overviewRuler: {
                  color: 'rgba(76, 105, 9, 0.94)',
                  position: monaco.editor.OverviewRulerLane.Full,
                },
                hoverMessage: {
                  value: hoverText,
                },
              },
            };
          });
        })
        .flat();
      mEditor.deltaDecorations([], matches);

      if (matches.length > 0) {
        mEditor.revealRangeNearTop(matches[0].range);
      }

      // Call the callback with the matched terms
      if (onHighlighted) {
        onHighlighted(Array.from(highlightedTerms.values()));
      }

      // TODO: research "setHiddenAreas" to implement reduced view
      // mEditor.setHiddenAreas(matches.map(m => m.range));
    } catch (e) {
      console.log('Error in highlightTerms:', e);
    }
  };

  useEffect(() => {
    initMonaco();
    return destroyMonaco;
  }, []);

  useEffect(() => {
    updateContent();
  }, [value]);

  useEffect(() => {
    updateHighlight();
  }, [highlight]);

  useEffect(() => {
    if (highlights && highlights.length > 0) {
      highlightTerms(highlights);
    }
  }, [highlights, value]);

  useEffect(() => {
    if(scrollToLine && editor.current) {
      // Clear previous line highlight
      scrollLineDecorations.current = editor.current.deltaDecorations(
        scrollLineDecorations.current,
        []
      );

      // Add new line highlight
      scrollLineDecorations.current = editor.current.deltaDecorations(
        [],
        [{
          range: new monaco.Range(scrollToLine, 1, scrollToLine, 1),
          options: {
            isWholeLine: true,
            className: 'lineHighlightDecoration',
            linesDecorationsClassName: 'lineRangeDecoration',
          }
        }]
      );

      editor.current.revealLineNearTop(scrollToLine);
      editor.current.setPosition({ lineNumber: scrollToLine, column: 1 });
      editor.current.focus();
    }
  }, [scrollToLine]);

  return <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CodeViewer;

CodeViewer.defaultProps = {
  highlights: null,
  options: {},
};
