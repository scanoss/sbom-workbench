import App from './App';

const app = new App();
app.setup();


/*
  TODO: workaround to solve Monaco bug on Chromium 114.
  See: https://github.com/microsoft/vscode/pull/183325
 */

// Save a reference to the original ResizeObserver
const OriginalResizeObserver = window.ResizeObserver;

// Create a new ResizeObserver constructor
// @ts-ignore
window.ResizeObserver = function (callback) {
  const wrappedCallback = (entries, observer) => {
    window.requestAnimationFrame(() => {
      callback(entries, observer);
    });
  };

  // Create an instance of the original ResizeObserver
  // with the wrapped callback
  return new OriginalResizeObserver(wrappedCallback);
};

// Copy over static methods, if any
for (const staticMethod in OriginalResizeObserver) {
  // eslint-disable-next-line no-prototype-builtins
  if (OriginalResizeObserver.hasOwnProperty(staticMethod)) {
    window.ResizeObserver[staticMethod] = OriginalResizeObserver[staticMethod];
  }
}
