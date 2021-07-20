import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeEditorProps {
  content: string;
  highlight?: number[] | null;
}

const CodeEditor = ({ content, highlight }: CodeEditorProps) => {
  return (
    <>
      <SyntaxHighlighter
        className='code-viewer'
        wrapLongLines
        style={nord}
        language='javascript'
        showLineNumbers
        lineProps={(line) => {
          const style = { display: 'block', backgroundColor: 'inherit' };
          if (highlight && highlight.includes(line)) {
            style.backgroundColor = '#ebe92252';
          }
          return { style };
        }}
      >
        {content}
      </SyntaxHighlighter>
    </>
  );
}

export default CodeEditor;


