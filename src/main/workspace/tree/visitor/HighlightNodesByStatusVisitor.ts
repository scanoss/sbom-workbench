import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';
import { NodeStatus } from '../Node';

type highlight = boolean;

export class HighlightNodesByStatusVisitor implements Visitor<highlight> {
  private statusToHighlight: NodeStatus;

  constructor(statusToHighlight: NodeStatus) {
    this.statusToHighlight = statusToHighlight;
  }

  VisitFile(file: File): highlight {
    if (file.getStatus() !== this.statusToHighlight) {
      // If the file does not match with the status, change the status to NOMATCH (it will grey out the icon on the UI)
      if (file.getStatus() !== NodeStatus.FILTERED) file.setStatus(file.getPath(), NodeStatus.NOMATCH);
      file.setStatusOnClassnameAs(NodeStatus.NOMATCH);
      file.setFilteredMatch(false);
      return false;
    }

    file.setFilteredMatch(true); // Highlight the file
    return true;
  }

  VisitFolder(folder: Folder): highlight {
    let folderHighlighted: highlight = false;

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
