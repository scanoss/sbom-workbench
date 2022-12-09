import fs from 'fs';
import { Tree } from '../../workspace/tree/Tree';

export async function migration150(projectPath: string): Promise<void> {
  await addChildFlagsOnFileTree(projectPath);

}

async function addChildFlagsOnFileTree(projectPath: string){
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  const tree = await fs.promises.readFile(`${projectPath}/tree.json`, 'utf8');
  const treeParsed = JSON.parse(tree);
  addFlags(treeParsed.tree.rootFolder);
  await fs.promises.writeFile(`${projectPath}/tree.json`, JSON.stringify(treeParsed));
 const fileTree = new Tree(metadata.name, projectPath,metadata.scan_root);
 fileTree.loadTree(treeParsed.tree.rootFolder);
 fileTree.updateFlags();
 const f = await  fileTree.getTree();
 treeParsed.tree.rootFolder = f;
 await  fs.promises.writeFile(`${projectPath}/tree.json`,JSON.stringify(treeParsed),'utf-8');
}

function addFlags(node: any){
  if(node.type === 'folder') {
    node.someFilteredChild = false;
    node.someNoMatchChild = false;
    node.someMatchChild = false;
    node.children.forEach((c)=>{
      addFlags(c);
    });
  }


}
