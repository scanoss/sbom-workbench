import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface ICodeViewerProps {
  value: string;
  language: string;
  highlight: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

const CodeViewer = ({ value, language, highlight, options }: ICodeViewerProps) => {
  const editor = React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const editorContainerRef = React.createRef<HTMLDivElement>();

  const initMonaco = () => {
    const ref = editorContainerRef.current;
    if (ref) {
      editor.current = monaco.editor.create(ref, {
        language,
        model: null,
        ...getDefaultOptions(),
        ...options,
      });
    }

  };

  const destroyMonaco = () => {
    if (editor.current) {
      editor.current.dispose();
    }
  };

  const getDefaultOptions = (): monaco.editor.IStandaloneEditorConstructionOptions => ({
    readOnly: true,
    automaticLayout: true,
    theme: 'vs-dark',
    fontSize: 12,
    lineNumbers: 'on',
    glyphMargin: highlight && highlight !== 'all',
  });

  const updateContent = () => {
    if (editor.current) {
      const model = editor.current.getModel();
      if (model) {
        model.dispose();
      }
      const nModel = monaco.editor.createModel(value, language);
      editor.current.setModel(nModel);
    }

    // editor.current.getAction("actions.find").run();
  };

  const updateHighlight = () => {
    if (editor.current) {
      if (highlight && highlight !== 'all') {
        const decorations = highlight.split(',').map((range: string) => {
          const [start, end] = range.split('-').map(Number);
          return {
            range: new monaco.Range(start, 1, end, 1),
            options: {
              isWholeLine: true,
              className: 'line-highlight',
              glyphMarginClassName: 'line-highlight',
            },
          };
        });
        editor.current.deltaDecorations(
          [],
          decorations,
        );

        editor.current.revealLineNearTop(decorations[0].range.startLineNumber);
      } else {
        // remove all decorations
        // editor.current.deltaDecorations([], []);
      }
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

  return <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CodeViewer;

CodeViewer.defaultProps = {
  options: {},
};
