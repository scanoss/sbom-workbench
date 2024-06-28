import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';
import { NodeStatus } from '../Node';

type isHighlighted = boolean;

export class DependencyHighlighterVisitor implements Visitor<isHighlighted> {
  VisitFile(file: File): isHighlighted {
    if (!file.isDependency()) {
      // If the file is not a dependency file, change the status to NOMATCH (it will grey out the icon on the UI)
      if (file.getStatus() !== NodeStatus.FILTERED) file.setStatus(file.getPath(), NodeStatus.NOMATCH);
      file.setStatusOnClassnameAs(NodeStatus.NOMATCH);
      file.setFilteredMatch(false);
      return false;
    }

    file.setFilteredMatch(true); // Highlight the dependency file
    return true;
  }

  VisitFolder(folder: Folder): isHighlighted {
    let folderHighlighted: isHighlighted = false;

    const children = folder.getChildren();
    folder.setFilteredMatch(folderHighlighted);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.accept(this)) folderHighlighted = true; // If any of the children was highlighted, highlight the current node as well
    }

    folder.setFilteredMatch(folderHighlighted);
    folder.updateStatusFlags();
    folder.setStatus(folder.getPath(), folder.getStatusClassName());
    folder.setStatusOnClassnameAs(folder.getStatus());

    return folderHighlighted;
  }
}
