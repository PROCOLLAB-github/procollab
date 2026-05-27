/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/primitives";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { expandElement } from "@utils/expand-element";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { TruncatePipe, DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/** Карточка вакансии в ленте с поддержкой разворачивания контента. */
@Component({
  selector: "app-open-vacancy",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterLink,
    TagComponent,
    DayjsPipe,
    ParseLinksPipe,
    ParseBreaksPipe,
    TruncatePipe,
    AvatarComponent,
  ],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenVacancyComponent implements AfterViewInit {
  @Input() feedItem!: Vacancy;
  protected readonly AppRoutes = AppRoutes;

  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  constructor(
    public readonly router: Router,
    private readonly cdRef: ChangeDetectorRef,
    public readonly industryRepository: IndustryRepositoryPort
  ) {}

  ngAfterViewInit(): void {
    // Проверяем, превышает ли описание доступную высоту
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    // Проверяем, превышает ли список навыков доступную высоту
    const skillsElement = this.skillsEl?.nativeElement;
    this.skillsExpandable = skillsElement?.clientHeight < skillsElement?.scrollHeight;

    // Обновляем UI после изменения флагов
    this.cdRef.detectChanges();
  }

  // Флаги для определения возможности развертывания контента
  descriptionExpandable!: boolean; // Можно ли развернуть описание
  skillsExpandable!: boolean; // Можно ли развернуть список навыков

  // Состояние развертывания контента
  readFullDescription = false; // Развернуто ли описание
  readFullSkills = false; // Развернут ли список навыков

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }
}
