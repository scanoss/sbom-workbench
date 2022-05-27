import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import CodeViewerManagerInstance from '../../pages/detected/pages/Editor/CodeViewerManager';

interface ICodeViewerProps {
  id: string;
  value: string;
  language: string;
  highlight: string;
  searchString?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

const CodeViewer = ({ id, value, language, highlight, searchString, options }: ICodeViewerProps) => {
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
  });

  const updateContent = () => {
    const { current: mEditor } = editor;

    if (mEditor) {
      const model = mEditor.getModel();
      if (model) model.dispose();

      const nModel = monaco.editor.createModel(value, language);
      mEditor.setModel(nModel);
      mEditor.focus();
      // mEditor.layout({} as monaco.editor.IDimension);
    }
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

  const findAndGo = (searchString: string) => {
    const { current: mEditor } = editor;
    console.log('find', searchString);

    try {
      const model = mEditor.getModel();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { range } = model.findMatches(searchString)[0];
      mEditor.setSelection(range);
    } catch (e) {
      console.log(e);
    }

    mEditor.getAction('actions.find').run();
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
    if (searchString) findAndGo(searchString);
  }, [searchString]);

  return <div ref={editorContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CodeViewer;

CodeViewer.defaultProps = {
  searchString: null,
  options: {},
};
