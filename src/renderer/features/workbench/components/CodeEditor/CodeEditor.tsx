import React, { useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { range } from '../../../../../utils/utils';

const LINES_MAX = 1000;
const CHAR_MAX_IN_LINE = 5000;
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

  // highlighFlag is true when code should be highlighted. False otherwise.
  const highlightFlag = !file.some((e) => e.length >= CHAR_MAX_IN_LINE);

  if (highlight && highlight !== 'all') {
    const [rangeStart, rangeEnd] = highlight.split('-');
    lines = range(parseInt(rangeStart, 10), parseInt(rangeEnd, 10));
    if (file.length > LINES_MAX) {
      start = Math.max(parseInt(rangeStart, 10) - LINES_OFFSET, 1);
      end = parseInt(rangeEnd, 10) + LINES_OFFSET;
    }
  }

  code = file.slice(start, end);

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
      {highlightFlag ? (
        <SyntaxHighlighter
          className={`
            code-viewer
            ${truncatedStart > 0 ? 'truncatedStart' : ''}
            ${truncatedEnd > 0 ? 'truncatedEnd' : ''}`}
          wrapLines
          style={vs2015}
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
          {code.join('\n')}
        </SyntaxHighlighter>
      ) : (
        <>
          <pre className="code-viewer nohighlight">
            <header className="">
              File length is too long,<br></br>highlighting has been disabled.
            </header>
            <code>
              {code.map((line, index) => (
                <div className={`line ${lines && lines.includes(index + 1) ? 'line-highlighted' : ''}`} key={index}>
                  <span className="linenumber">{index + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </>
      )}
    </>
  );
};

export default CodeEditor;
