/** @format */

import { Injectable, signal } from "@angular/core";

@Injectable()
export class TooltipInfoService {
  readonly isTooltipVisible = signal<boolean>(false);
  /** Позиция подсказки */
  readonly tooltipPosition: "left" | "right" = "right";

  readonly haveHint = signal<boolean>(false);

  readonly isHintPhotoVisible = signal<boolean>(false);
  readonly isHintCityVisible = signal<boolean>(false);
  readonly isHintEducationVisible = signal<boolean>(false);
  readonly isHintEducationDescriptionVisible = signal<boolean>(false);
  readonly isHintWorkVisible = signal<boolean>(false);
  readonly isHintWorkNameVisible = signal<boolean>(false);
  readonly isHintWorkDescriptionVisible = signal<boolean>(false);
  readonly isHintAchievementsVisible = signal<boolean>(false);
  readonly isHintLanguageVisible = signal<boolean>(false);
  readonly isHintAuthVisible = signal<boolean>(false);
  readonly isHintLibVisible = signal<boolean>(false);
  readonly isHintLoginVisible = signal<boolean>(false);
  readonly isHintTeamVisible = signal<boolean>(false);
  readonly isHintExpertsVisible = signal<boolean>(false);

  /** Показать подсказку */
  showTooltip(
    type:
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
      | "login" = "base"
  ): void {
    switch (type) {
      case "photo":
        this.isHintPhotoVisible.set(true);
        break;
      case "city":
        this.isHintCityVisible.set(true);
        break;
      case "education":
        this.isHintEducationVisible.set(true);
        break;
      case "educationDescription":
        this.isHintEducationDescriptionVisible.set(true);
        break;
      case "work":
        this.isHintWorkVisible.set(true);
        break;
      case "workName":
        this.isHintWorkNameVisible.set(true);
        break;
      case "workDescription":
        this.isHintWorkDescriptionVisible.set(true);
        break;
      case "achievements":
        this.isHintAchievementsVisible.set(true);
        break;
      case "language":
        this.isHintLanguageVisible.set(true);
        break;
      case "auth":
        this.isHintAuthVisible.set(true);
        break;
      case "lib":
        this.isHintLibVisible.set(true);
        break;

      default:
        this.isTooltipVisible.set(true);
        break;
    }
  }

  /** Скрыть подсказку */
  hideTooltip(
    type:
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
      | "team"
      | "experts" = "base"
  ): void {
    switch (type) {
      case "photo":
        this.isHintPhotoVisible.set(false);
        break;
      case "city":
        this.isHintCityVisible.set(false);
        break;
      case "education":
        this.isHintEducationVisible.set(false);
        break;
      case "educationDescription":
        this.isHintEducationDescriptionVisible.set(false);
        break;
      case "work":
        this.isHintWorkVisible.set(false);
        break;
      case "workName":
        this.isHintWorkNameVisible.set(false);
        break;
      case "workDescription":
        this.isHintWorkDescriptionVisible.set(false);
        break;
      case "achievements":
        this.isHintAchievementsVisible.set(false);
        break;
      case "language":
        this.isHintLanguageVisible.set(false);
        break;
      case "auth":
        this.isHintAuthVisible.set(false);
        break;
      case "lib":
        this.isHintLibVisible.set(false);
        break;
      case "team":
        this.isHintTeamVisible.set(false);
        break;
      case "experts":
        this.isHintExpertsVisible.set(false);
        break;

      default:
        this.isTooltipVisible.set(false);
        break;
    }
  }

  toggleTooltip(): void {
    this.isHintLoginVisible.set(!this.isHintLoginVisible());
  }
}
