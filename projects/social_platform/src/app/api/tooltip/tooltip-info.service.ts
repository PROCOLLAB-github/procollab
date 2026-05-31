/** @format */

import { Injectable, signal } from "@angular/core";

export type TooltipKey =
  | "base"
  | "photo"
  | "city"
  | "education"
  | "educationDescription"
  | "work"
  | "workName"
  | "workDescription"
  | "achievements"
  | "language"
  | "auth"
  | "lib"
  | "login"
  | "team";

/** Реестр состояния тултипов по ключу: show/hide/toggle. */
@Injectable()
export class TooltipInfoService {
  readonly isTooltipVisible = signal<Partial<Record<TooltipKey, boolean>>>({});
  /** Позиция подсказки */
  readonly tooltipPosition: "left" | "right" = "right";

  readonly haveHint = signal<boolean>(false);

  readonly isVisible = (key: TooltipKey): boolean => this.isTooltipVisible()[key] ?? false;

  show(key: TooltipKey) {
    return this.isTooltipVisible.update(state => ({
      ...state,
      [key]: true,
    }));
  }

  hide(key: TooltipKey) {
    return this.isTooltipVisible.update(state => ({
      ...state,
      [key]: false,
    }));
  }

  toggleTooltip(key: TooltipKey): void {
    this.isTooltipVisible.update(state => ({
      ...state,
      [key]: !state[key],
    }));
  }
}
