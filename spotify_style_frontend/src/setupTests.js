// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

/**
 * jsdom doesn't implement real media playback. Our app creates `new Audio()`
 * in PlaybackContext, so tests must stub the relevant APIs to prevent
 * "Not implemented" errors.
 */
beforeAll(() => {
  // Stub HTMLMediaElement methods commonly used by players.
  // `play()` must return a Promise per spec.
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: jest.fn(),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: jest.fn(),
  });

  // Some environments may not have Audio defined; define it to return a media element.
  if (!("Audio" in window)) {
    Object.defineProperty(window, "Audio", {
      configurable: true,
      value: function Audio() {
        return document.createElement("audio");
      },
    });
  }
});
