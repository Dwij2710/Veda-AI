import '@testing-library/jest-dom';

// Mock scrollIntoView in jsdom environment
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
