/** @format */

import { ElementRef, Injectable, signal } from "@angular/core";
import { expandElement } from "@utils/expand-element";

@Injectable({ providedIn: "root" })
export class ExpandService {
  readonly readFullDescription = signal(false);
  readonly descriptionExpandable = signal(false);

  readonly readFullSkills = signal(false);
  readonly skillsExpandable = signal(false);

  readonly readAllAchievements = signal<boolean>(false); // Флаг показа всех достижений

  readonly readAllVacancies = signal<boolean>(false); // Флаг показа всех вакансий

  readonly readAllMembers = signal<boolean>(false); // Флаг показа всех участников

  readonly readAllProjects = signal<boolean>(false);

  readonly readAllPrograms = signal<boolean>(false);

  readonly readAllLinks = signal<boolean>(false);

  readonly readAllEducation = signal<boolean>(false);

  readonly readAllLanguages = signal<boolean>(false);

  readonly readAllWorkExperience = signal<boolean>(false);

  onExpand(
    type: "description" | "skills",
    elem: HTMLElement,
    expandedClass: string,
    isExpanded: boolean
  ): void {
    expandElement(elem, expandedClass, isExpanded);
    type === "description"
      ? this.readFullDescription.set(!isExpanded)
      : this.readFullSkills.set(!isExpanded);
  }

  checkExpandable(type: "description" | "skills", hasText: boolean, descEl?: ElementRef): void {
    const el = descEl?.nativeElement;
    type === "description"
      ? this.descriptionExpandable.set(!!el && hasText && el.scrollHeight > el.clientHeight)
      : this.skillsExpandable.set(!!el && hasText && el.scrollHeight > el.clientHeight);
  }
}
