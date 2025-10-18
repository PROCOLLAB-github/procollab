/** @format */
import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Vacancy } from "@office/models/vacancy.model";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { expandElement } from "@utils/expand-element";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

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
    TagComponent,
    AvatarComponent,
  ],
  templateUrl: "./project-vacancy-card.component.html",
  styleUrl: "./project-vacancy-card.component.scss",
})
export class ProjectVacancyCardComponent implements OnInit {
  @Input({ required: true }) vacancy!: Vacancy; // Данные вакансии (обязательное поле)
  @Input() type: "vacancies" | "project" = "project";

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
