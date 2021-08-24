import React, { useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { range } from '../../../../utils/utils';

interface CodeEditorProps {
  content: string;
  highlight: number[];
}

const CodeEditor = ({ content, highlight }: CodeEditorProps) => {
  const lines = highlight && range(parseInt(highlight.split('-')[0], 10), parseInt(highlight.split('-')[1], 10));

  const scroll = () => {
    // FIXME: select only for this component
    const editor = document.querySelectorAll('.code-viewer');
    editor.forEach((element) => {
      const line = element.querySelector('.line-highlighted');
      if (line) {
        line.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    scroll();
  }, []);

  return (
    <>
      <SyntaxHighlighter
        className="code-viewer"
        wrapLongLines
        style={nord}
        language="javascript"
        showLineNumbers
        lineProps={(line) => {
          if (lines && lines.includes(line)) {
            return { class: 'line-highlighted' };
          }
          return {};
        }}
      >
        {content.slice(0, 30000)}
      </SyntaxHighlighter>
    </>
  );
};

export default CodeEditor;
