import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { range } from '../../../../utils/utils';

interface CodeEditorProps {
  content: string;
  highlight?: number[] | null;
}

const CodeEditor = ({ content, highlight }: CodeEditorProps) => {
  const lines = range(parseInt(highlight?.split('-')[0], 10), parseInt(highlight?.split('-')[1], 10));
  console.log(lines);
  return (
    <>
      <SyntaxHighlighter
        className="code-viewer"
        wrapLongLines
        style={nord}
        language="javascript"
        showLineNumbers
        startingLineNumber={lines[99]}
        lineProps={(line) => {
          const style = { display: 'block', backgroundColor: 'inherit' };
          if (lines && lines.includes(line)) {
            style.backgroundColor = '#ebe92252';
          }
          return { style };
        }}
      >
        {content.slice(0, 30000)}
      </SyntaxHighlighter>
    </>
  );
};

export default CodeEditor;
