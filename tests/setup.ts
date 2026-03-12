import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Polyfill Element.prototype.getAnimations for Headless UI
if (typeof Element.prototype.getAnimations === "undefined") {
  Element.prototype.getAnimations = () => [];
}

// Clean up DOM and portals between tests
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
