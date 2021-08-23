import React, { useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { range } from '../../../../utils/utils';

interface CodeEditorProps {
  content: string;
  highlight?: number[] | null;
}

const CodeEditor = ({ content, highlight }: CodeEditorProps) => {
  const lines = range(parseInt(highlight?.split('-')[0], 10), parseInt(highlight?.split('-')[1], 10));

  const automaticScrollHandler = () => {
    const editor = document.getElementsByClassName('code-viewer');
    console.log(editor);
    Array.from(editor).forEach((element) => {
      const lineas = element.children[0].children;
      const arrayLineas = Array.from(lineas);
      console.log(arrayLineas);
      arrayLineas.forEach((linea) => {
        if (linea.id === 'linelaited') {
          linea.scrollIntoView();
        }
      })
    });
    // const element = document.getElementById('linelaited');
    // element?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    automaticScrollHandler();
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
          const style = { display: 'block', backgroundColor: 'inherit' };
          if (lines && lines.includes(line)) {
            style.backgroundColor = '#ebe92252';
            return { style, id: 'linelaited' };
          }
          return { style };
        }}
        onScroll={() => {
          console.log('scrolleandoooooo');
        }}
      >
        {content.slice(0, 30000)}
      </SyntaxHighlighter>
    </>
  );
};

export default CodeEditor;
