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

if (!URL.createObjectURL) {
  let counter = 0;
  const objectURLs = new Map<string, string>();
  (URL as any).createObjectURL = function (blob: Blob): string {
    const id = `blob:${++counter}`;
    const url = `blob:${id}`;
    objectURLs.set(url, blob as any);
    return url;
  };
  (URL as any).revokeObjectURL = function (url: string): void {
    objectURLs.delete(url);
  };
}

setupTestBed();
