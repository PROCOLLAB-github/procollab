/** @format */

import { DOCUMENT } from "@angular/common";
import { DestroyRef, Injectable, inject, signal } from "@angular/core";

export type ThemeScheme = "light" | "dark";
export type ThemePreference = "system" | ThemeScheme;

// Also read in index.html, before the stylesheet is rendered.
const STORAGE_KEY = "procollab-theme";

function parsePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = this.document.defaultView;
  private readonly systemTheme = this.browser?.matchMedia?.("(prefers-color-scheme: dark)");
  private readonly storage = this.getStorage();
  private readonly selected = signal<ThemePreference>("system");
  private readonly resolved = signal<ThemeScheme>("light");

  readonly preference = this.selected.asReadonly();
  readonly colorScheme = this.resolved.asReadonly();

  constructor() {
    this.apply(this.readPreference());

    const onSystemChange = () => this.apply(this.preference());
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === this.storage && (event.key === STORAGE_KEY || event.key === null)) {
        this.apply(parsePreference(event.newValue));
      }
    };
    this.systemTheme?.addEventListener?.("change", onSystemChange);
    this.browser?.addEventListener("storage", onStorage);
    inject(DestroyRef).onDestroy(() => {
      this.systemTheme?.removeEventListener?.("change", onSystemChange);
      this.browser?.removeEventListener("storage", onStorage);
    });
  }

  setPreference(preference: ThemePreference): void {
    this.apply(preference);
    try {
      this.storage?.setItem(STORAGE_KEY, preference);
    } catch {
      // The selection still applies if browser storage is restricted.
    }
  }

  private apply(preference: ThemePreference): void {
    const scheme =
      preference === "system" ? (this.systemTheme?.matches ? "dark" : "light") : preference;
    this.document.documentElement.dataset["theme"] = scheme;
    this.selected.set(preference);
    this.resolved.set(scheme);
  }

  private getStorage(): Storage | undefined {
    try {
      return this.browser?.localStorage;
    } catch {
      return undefined;
    }
  }

  private readPreference(): ThemePreference {
    try {
      return parsePreference(this.storage?.getItem(STORAGE_KEY));
    } catch {
      return "system";
    }
  }
}
