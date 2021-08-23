import React, { useEffect } from 'react';
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
  const codeEditor = React.createRef();

  const automaticScrollHandler = async () => {
    const arrayFromHTMLCollection = document.getElementsByClassName('language-javascript');
    const arraysito = Array.from(arrayFromHTMLCollection);
    await arraysito.forEach((element) => {
      element.children[lines[0]].setAttribute('id', 'linelaited');
    });
    const element = document.getElementById('linelaited');
    element?.scrollIntoView({ behavior: 'smooth' })
    // document.getElementsByClassName('language-javascript')[1].children[lines[0]].setAttribute('id', 'linelaited');
  };

  useEffect(() => {
    automaticScrollHandler();
  }, [codeEditor]);

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
          }
          return { style };
        }}
        onScroll={() => {
          console.log('bananaaa');
        }}
        ref={codeEditor}
      >
        {content.slice(0, 30000)}
      </SyntaxHighlighter>
    </>
  );
};

export default CodeEditor;
