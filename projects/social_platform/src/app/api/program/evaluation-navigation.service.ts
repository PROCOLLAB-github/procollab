/** @format */
import { Injectable } from "@angular/core";
import { AppRoutes } from "@api/paths/app-routes";

export function cabinetReturnUrl(value: string | null, programId: number | string): string {
  return value && /^\/office\/evaluation(?:\?[^#]*)?$/.test(value)
    ? value
    : `${AppRoutes.office.evaluation()}?program=${programId}`;
}

/** In-memory position only; assessment values are never persisted here. */
@Injectable({ providedIn: "root" })
export class EvaluationNavigationService {
  private readonly positions = new Map<string, { top: number; windowTop: number; limit: number }>();
  remember(url: string, limit = 10): void {
    this.positions.set(url, {
      top: document.querySelector(".office__body")?.scrollTop ?? 0,
      windowTop: window.scrollY,
      limit,
    });
  }
  limit(url: string): number {
    return this.positions.get(url)?.limit ?? 10;
  }
  restore(url: string): void {
    const position = this.positions.get(url);
    if (!position) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.querySelector(".office__body")?.scrollTo({ top: position.top });
        window.scrollTo({ top: position.windowTop });
      }),
    );
  }
}
