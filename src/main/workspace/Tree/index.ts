import Node from './Tree/Node';
import File from './Tree/Folder';
import Folder from './Tree/File';

const fs = require('fs');
const path = require('path');



function dirFirstFileAfter(a: any, b: any) {
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && !b.isDirectory()) return -1;
    return 0;
  }

export default function buildTree(dir: string): Node {
	console.log("aca");
    const f: Folder = new Folder(dir);

    const dirEntries = fs.readdirSync(dir, { withFileTypes: true }) // Returns a list of files and folders
    .sort(dirFirstFileAfter)
    .filter((dirent: any) => !dirent.isSymbolicLink());

    console.log(dirEntries); // [folder2, file1]

    for (const dirEntry of dirEntries) {
        if (dirEntry.isDirectory()) {
            const subTree: Node = buildTree(dir + '/' + dirEntry.name);
            f.addChild(subTree);
        } else return new File(dir + '/' + dirEntry.name);
    }

    return f;
}
