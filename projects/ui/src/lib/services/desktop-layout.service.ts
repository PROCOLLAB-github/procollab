/** @format */

import { inject, Injectable } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

/** Presentation boundary shared by legacy desktop and responsive templates. */
@Injectable({ providedIn: "root" })
export class DesktopLayoutService {
  readonly desktop = toSignal(
    inject(BreakpointObserver)
      .observe("(min-width: 1000px)")
      .pipe(map(state => state.matches)),
    { initialValue: typeof window !== "undefined" && window.innerWidth >= 1000 },
  );
}
