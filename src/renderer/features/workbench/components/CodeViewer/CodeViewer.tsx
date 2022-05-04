import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';

const CodeViewer = ({ value, language, highlight }) => {
  const editorRef = React.createRef<HTMLDivElement>();
  const [editor, setEditor] = React.useState(null);

  const initMonaco = () => {
    const editorInstance = monaco.editor.create(editorRef.current, {
      value,
      language,
      readOnly: true,
      automaticLayout: true,
      theme: 'vs-dark',
      lineNumbers: 'on',
      fontSize: 12,
    });

    if (highlight) {
      const [start, end] = highlight.split('-');
      const decorations = editorInstance.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(Number(start), 1, Number(end), 1),
            options: {
              isWholeLine: true,
              className: 'line-highlighted',
            }
          }
        ]
      );
    }
    setEditor(editorInstance);
  };

  useEffect(() => {
    editor?.setValue(value);
  }, [value]);

  useEffect(() => {
    initMonaco()
  }, []);

  return <div ref={editorRef} style={{ width: '100%', height: '100%' }} />;
};

export default CodeViewer;
