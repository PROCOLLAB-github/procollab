/** @format */

import { CommonModule } from "@angular/common";
import { Component, ElementRef, inject, Input, ViewChild, WritableSignal } from "@angular/core";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { TagComponent } from "@ui/components/tag/tag.component";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { VacancyDetailInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-detail-info.service";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";

@Component({
  selector: "app-vacancies-left-side",
  templateUrl: "./vacancies-left-side.component.html",
  styleUrl: "./vacancies-left-side.component.scss",
  imports: [CommonModule, ParseBreaksPipe, ParseLinksPipe, TagComponent],
  standalone: true,
})
export class VacanciesLeftSideComponent {
  @Input() vacancy!: WritableSignal<Vacancy | undefined>;

  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly skillsExpandable = this.expandService.skillsExpandable;

  protected readonly readFullDescription = this.expandService.readFullDescription;
  protected readonly readFullSkills = this.expandService.readFullSkills;

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.vacancyDetailInfoService.initCheckDescription(descElement);

    const skillsElement = this.skillsEl?.nativeElement;
    this.vacancyDetailInfoService.initCheckSkills(skillsElement);
  }

  /**
   * Раскрытие/сворачивание описания профиля
   * @param elem - DOM элемент описания
   * @param expandedClass - CSS класс для раскрытого состояния
   * @param isExpanded - текущее состояние (раскрыто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("description", elem, expandedClass, isExpanded);
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("skills", elem, expandedClass, isExpanded);
  }
}
