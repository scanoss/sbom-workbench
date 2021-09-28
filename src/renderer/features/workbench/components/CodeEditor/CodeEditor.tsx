import React, { useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { range } from '../../../../../utils/utils';

const LINES_MAX = 1000;
const LINES_OFFSET = 50;

interface CodeEditorProps {
  content: string;
  highlight: string;
}

const CodeEditor = ({ content, highlight }: CodeEditorProps) => {
  const file = content.split('\n');

  let lines = null;
  let code = null;
  let start = 0;
  let end = LINES_MAX;

  if (highlight && highlight !== 'all') {
    const [rangeStart, rangeEnd] = highlight.split('-');
    lines = range(parseInt(rangeStart, 10), parseInt(rangeEnd, 10));
    if (file.length > LINES_MAX) {
      start = Math.max(parseInt(rangeStart, 10) - LINES_OFFSET, 1);
      end = parseInt(rangeEnd, 10) + LINES_OFFSET;
    }
  }

  code = file.slice(start, end).join('\n');

  const truncatedStart = start - 1;
  const truncatedEnd = file.length - end;

  const scroll = () => {
    // FIXME: select only for this component
    const editor = document.querySelectorAll('.code-viewer');
    editor.forEach((element) => {
      const line = element.querySelector('.line-highlighted');
      if (line) {
        line.scrollIntoView();
      }
    });
  };

  useEffect(() => {
    scroll();
  }, []);

  return (
    <>
      <SyntaxHighlighter
        className={`
          code-viewer
          ${truncatedStart > 0 ? 'truncatedStart' : ''}
          ${truncatedEnd > 0 ? 'truncatedEnd' : ''}`}
        wrapLines
        style={nord}
        language="javascript"
        startingLineNumber={start + 1}
        showLineNumbers
        lineProps={(line) => {
          if (lines && lines.includes(line)) {
            return { class: 'line-highlighted' };
          }
          return {};
        }}
      >
        {code}
      </SyntaxHighlighter>
    </>
  );
};

export default CodeEditor;
