import React, { useEffect } from 'react';
import * as monaco from 'monaco-editor';

export const CodeViewer = ({ content, language, highlight }) => {
  const [editor, setEditor] = React.useState(null);
  const initMonaco = () => {
    const editorInstance = monaco.editor.create(document.getElementById('editor'), {
      value: content,
      language,
      readOnly: true,
      theme: 'vs-dark',
      lineNumbers: 'on',
    });

    /*const decorations = editorInstance.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(3, 1, 30, 10),
          options: {
            isWholeLine: true,
            className: 'myContentClass',
            glyphMarginClassName: 'myGlyphMarginClass'
          }
        }
      ]
    );*/
    setEditor(editorInstance);
  };

  useEffect(() => {
    editor?.updateOptions({
      value: content,
    });
  }, [content]);

  useEffect(() => {
    initMonaco()
  }, []);

  return <div id="editor" />;
};

export default CodeViewer;
