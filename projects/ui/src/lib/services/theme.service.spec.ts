/** @format */

import { TestBed } from "@angular/core/testing";
import { FORCED_THEME_SCHEME, ThemeService } from "./theme.service";

describe("ThemeService instance policy", () => {
  let media: EventTarget & { matches: boolean };
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    media = Object.assign(new EventTarget(), { matches: true });
    vi.stubGlobal("matchMedia", () => media);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    localStorage.clear();
    delete document.documentElement.dataset["theme"];
  });

  it("keeps the pilot light with stored dark and system dark without erasing preference", () => {
    localStorage.setItem("procollab-theme", "dark-special");
    TestBed.configureTestingModule({
      providers: [{ provide: FORCED_THEME_SCHEME, useValue: "light" }],
    });
    const theme = TestBed.inject(ThemeService);
    expect(theme.canChooseTheme).toBe(false);
    expect(theme.preference()).toBe("light");
    expect(document.documentElement.dataset["theme"]).toBe("light");
    theme.setPreference("dark");
    media.dispatchEvent(new Event("change"));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "procollab-theme",
        newValue: "dark",
        storageArea: localStorage,
      }),
    );
    expect(theme.colorScheme()).toBe("light");
    expect(localStorage.getItem("procollab-theme")).toBe("dark-special");
  });

  it("preserves selectable themes and system/storage synchronization without an override", () => {
    const theme = TestBed.inject(ThemeService);
    expect(theme.canChooseTheme).toBe(true);
    expect(theme.colorScheme()).toBe("dark");
    theme.setPreference("dark-special");
    expect(localStorage.getItem("procollab-theme")).toBe("dark-special");
    theme.setPreference("system");
    media.matches = false;
    media.dispatchEvent(new Event("change"));
    expect(theme.colorScheme()).toBe("light");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "procollab-theme",
        newValue: "dark",
        storageArea: localStorage,
      }),
    );
    expect(theme.colorScheme()).toBe("dark");
  });
});
