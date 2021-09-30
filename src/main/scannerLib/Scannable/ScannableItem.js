export class ScannableItem {
  contentSource;

  content;

  scanMode;

  fingerprint;

  maxSizeWfp;

  constructor(content, contentSource, scanMode, maxSizeWfp) {
    this.contentSource = contentSource;
    this.content = content;
    this.scanMode = scanMode;
    this.maxSizeWfp = maxSizeWfp;
  }

  getContent() {
    return this.content;
  }

  getContentSource() {
    return this.contentSource;
  }


}
