/** @format */

import { Injectable } from "@angular/core";
import { animate, AnimationTriggerMetadata, style, transition, trigger } from "@angular/animations";

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor() {}

  public static get slideInOut(): AnimationTriggerMetadata {
    return trigger("slideInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%)" }),
        animate(200, style({ opacity: 1, transform: "translateX(0)" })),
      ]),
      transition(":leave", [
        style({ opacity: 1, transform: "translateX(0)" }),
        animate(200, style({ opacity: 0, transform: "translateX(100%)" })),
      ]),
    ]);
  }
}
