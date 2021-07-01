import { CardContent } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  nord,
  atomOneDark,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { isNull } from 'util';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';
import { DialogContext } from '../../DialogProvider';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import MatchCard from '../../components/MatchCard/MatchCard';
import { range } from '../../../../utils/utils';
import { inventoryService } from '../../../../api/inventory-service';
import { Inventory } from '../../../../api/types';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';

export const Editor = () => {
  const history = useHistory();

  const { file, matchInfo, remoteFileContent, localFileContent, component } =
    useContext(WorkbenchContext) as IWorkbenchContext;

  const { setInventoryBool, inventoryBool } = useContext(DialogContext);

  const [ossLines, setOssLines] = useState<number[] | null>([]);
  const [lines, setLines] = useState<number[] | null>([]);

  useEffect(() => {
    console.log(matchInfo?.matched);
    if (!matchInfo) {
      return;
    }

    const linesOss =
      matchInfo?.id === 'file'
        ? null
        : range(
            parseInt(matchInfo?.oss_lines.split('-')[0]),
            parseInt(matchInfo?.oss_lines.split('-')[1])
          );

    setOssLines(linesOss);
    const lineasLocales =
      matchInfo?.id === 'file'
        ? null
        : range(
            parseInt(matchInfo?.lines.split('-')[0]),
            parseInt(matchInfo?.lines.split('-')[1])
          );
    setLines(lineasLocales);
  }, [matchInfo]);

  const handleClose = async (inventory: Inventory) => {
    setInventoryBool(false);
    const newInventory = await inventoryService.create({
      ...inventory,
      files: component ? component.files : [],
    });
    console.log(newInventory);
  };

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          {matchInfo ? (
            <>
              <div className="match-title">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon className="arrow-icon" />
                </IconButton>
                <span className="match-span">Match</span>
              </div>
              <header className="match-info-header">
                <CardContent className="content">
                  <div className="match-info-container">
                    <div className="second-row-match">
                      <div>
                        <Label label="COMPONENT" textColor="gray" />
                        <Title title={matchInfo?.component} />
                      </div>
                      <div>
                        <Label label="VENDOR" textColor="gray" />
                        <Title title={matchInfo?.vendor} />
                      </div>
                      <div>
                        <Label label="VERSION" textColor="gray" />
                        <Title title={matchInfo?.version} />
                      </div>
                      <div>
                        <Label label="LICENSE" textColor="gray" />
                        <Title
                          title={
                            matchInfo?.licenses[0]
                              ? matchInfo?.licenses[0].name
                              : '-'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <MatchCard
                    labelOfCard={file}
                    onClickCheck={() => setInventoryBool(true)}
                    status="pending"
                  />
                </CardContent>
              </header>
            </>
          ) : (
            <h1>No info</h1>
          )}
        </header>

        <main className="editors app-content">
          <div className="editor">
            {localFileContent?.content ? (
              <>
                <p>Source File</p>
                <SyntaxHighlighter
                  className="code-viewer"
                  language="javascript"
                  wrapLongLines="true"
                  style={nord}
                  showLineNumbers
                  lineNumberStyle={{ color: '#ddd', fontSize: 20 }}
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (lines && lines.includes(lineNumber)) {
                      style.backgroundColor = '#EBE922';
                    }
                    return { style };
                  }}
                >
                  {localFileContent?.error ? (
                    <p>File not found</p>
                  ) : (
                    localFileContent?.content?.toString()
                  )}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>

          <div className="editor">
            {remoteFileContent?.content ? (
              <>
                <p>Component File</p>
                <SyntaxHighlighter
                  className="code-viewer"
                  language="javascript"
                  wrapLongLines="true"
                  style={nord}
                  showLineNumbers
                  lineNumberStyle={{
                    color: '#ddd',
                    fontSize: 15,
                    minWidth: 1.25,
                  }}
                  lineNumberContainerStyle={{ marginRigth: 20 }}
                  //
                  lineProps={(lineNumber) => {
                    const style = { display: 'block' };
                    if (ossLines && ossLines.includes(lineNumber)) {
                      style.backgroundColor = '#EBE922';
                    }
                    return { style };
                  }}
                >
                  {remoteFileContent?.error ? (
                    <p>File not found</p>
                  ) : (
                    remoteFileContent?.content?.toString()
                  )}
                </SyntaxHighlighter>
              </>
            ) : null}
          </div>
        </main>

        {/* <section className="editors">
        <div className="editor">
          <pre>
            {remoteFileContent?.error ? (
              <p>File not found</p>
            ) : (
              remoteFileContent?.content
            )}
          </pre>
        </div>

        <div className="editor">
          <pre>
            {remoteFileContent?.error ? (
              <p>File not found</p>
            ) : (
              remoteFileContent?.content
            )}
          </pre>
        </div>
      </section> */}
      </section>
      <InventoryDialog
        open={inventoryBool}
        onClose={handleClose}
        component={component}
      />
    </>
  );
};

export default Editor;
