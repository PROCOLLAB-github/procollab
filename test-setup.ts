/** @format */

import { setupTestBed } from "@analogjs/vitest-angular/setup-testbed";

if (typeof IntersectionObserver === "undefined") {
  (globalThis as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!Element.prototype.scrollTo) {
  (Element.prototype as any).scrollTo = function () {};
}

setupTestBed();
