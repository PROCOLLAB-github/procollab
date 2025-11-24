/** @format */
import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Vacancy } from "@office/models/vacancy.model";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { expandElement } from "@utils/expand-element";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";

/**
 * КОМПОНЕНТ КАРТОЧКИ ВАКАНСИИ ПРОЕКТА
 *
 * Этот компонент отображает информацию об вакансии проекта в виде карточки
 *
 * НАЗНАЧЕНИЕ:
 * - Отображение информации об вакансии
 *
 * @params
 * - vacancy: Vacancy - объект с данными вакансии (обязательный)
 *
 * ФУНКЦИОНАЛЬНОСТЬ:
 * - Отображение информации вакансии
 * - Ссылка на вакансию
 *
 * @returns
 * - HTML-разметка карточки вакансии
 */
@Component({
  selector: "app-project-vacancy-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    TruncatePipe,
    TagComponent,
    AvatarComponent,
    DayjsPipe,
  ],
  templateUrl: "./project-vacancy-card.component.html",
  styleUrl: "./project-vacancy-card.component.scss",
})
export class ProjectVacancyCardComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) vacancy!: Vacancy; // Данные вакансии (обязательное поле)
  @Input() type: "vacancies" | "project" = "project";

  @ViewChild("descEl") descEl?: ElementRef;

  private readonly cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (this.type === "project") {
      this.endSliceOfSkills = 5;
    } else {
      this.endSliceOfSkills = 3;
    }
  }

  descriptionExpandable!: boolean; // Флаг необходимости кнопки "Читать полностью"
  readFullDescription = false; // Флаг показа всех вакансий
  endSliceOfSkills = 0;

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  /**
   * Раскрытие/сворачивание описания профиля
   * @param elem - DOM элемент описания
   * @param expandedClass - CSS класс для раскрытого состояния
   * @param isExpanded - текущее состояние (раскрыто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
