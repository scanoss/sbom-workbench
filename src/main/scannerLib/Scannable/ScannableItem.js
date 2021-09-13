export class ScannableItem {
  contentSource;

  content;

  scanMode;

  fingerprint;

  constructor(contentSource, content, scanMode) {
    this.contentSource = contentSource;
    this.content = content;
    this.scanMode = scanMode;
  }

  getContent() {
    return this.content;
  }

  getContentSource() {
    return this.contentSource;
  }


}
