/** @format */

import { ElementRef, Injectable, signal } from "@angular/core";
import { expandElement } from "@utils/expand-element";

export type ReadAllKey =
  | "achievements"
  | "vacancies"
  | "members"
  | "projects"
  | "programs"
  | "links"
  | "education"
  | "languages"
  | "workExperience";

@Injectable()
export class ExpandService {
  readonly readFullDescription = signal(false);
  readonly descriptionExpandable = signal(false);

  readonly readFullSkills = signal(false);
  readonly skillsExpandable = signal(false);

  readonly readAll = signal<Record<ReadAllKey, boolean>>({
    achievements: false,
    vacancies: false,
    members: false,
    projects: false,
    programs: false,
    links: false,
    education: false,
    languages: false,
    workExperience: false,
  });

  isReadAll(key: ReadAllKey): boolean {
    return this.readAll()[key];
  }

  toggleReadAll(key: ReadAllKey): void {
    this.readAll.update(state => ({
      ...state,
      [key]: !state[key],
    }));
  }

  setReadAll(key: ReadAllKey, value: boolean): void {
    this.readAll.update(state => ({
      ...state,
      [key]: value,
    }));
  }

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
