export class ScannableItem {
  contentSource;

  content;

  constructor(contentSource, content) {
    this.contentSource = contentSource;
    this.content = content;
  }

  getContent() {
    return this.content;
  }

  getContentSource() {
    return this.contentSource;
  }
}
