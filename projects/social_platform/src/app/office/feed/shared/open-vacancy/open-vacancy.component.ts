/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";
import { Vacancy } from "@models/vacancy.model";
import { expandElement } from "@utils/expand-element";

/**
 * КОМПОНЕНТ ОТКРЫТОЙ ВАКАНСИИ
 *
 * Отображает карточку активной вакансии в ленте новостей с полным функционалом.
 * Поддерживает развертывание/свертывание длинного контента и интерактивные элементы.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение полной информации о вакансии
 * - Развертывание/свертывание описания и списка навыков
 * - Навигация к детальной странице вакансии
 * - Форматирование текста с поддержкой ссылок и переносов строк
 * - Отображение тегов и навыков
 *
 * ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ:
 * - Кнопки "Показать полностью" / "Свернуть"
 * - Теги навыков и требований
 * - Ссылки на детальную страницу
 *
 * ИСПОЛЬЗУЕМЫЕ ПАЙПЫ:
 * - DayjsPipe: форматирование дат
 * - ParseLinksPipe: преобразование ссылок в кликабельные элементы
 * - ParseBreaksPipe: обработка переносов строк
 */
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
  ],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
})
export class OpenVacancyComponent implements AfterViewInit {
  /**
   * ВХОДНЫЕ ДАННЫЕ
   *
   * @Input feedItem - объект вакансии для отображения
   * Содержит всю информацию о вакансии: название, описание, требования, навыки и т.д.
   */
  @Input() feedItem!: Vacancy;

  /**
   * ССЫЛКИ НА DOM ЭЛЕМЕНТЫ
   *
   * @ViewChild skillsEl - ссылка на элемент со списком навыков
   * @ViewChild descEl - ссылка на элемент с описанием вакансии
   *
   * Используются для определения необходимости показа кнопок развертывания
   */
  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  constructor(public readonly router: Router, private readonly cdRef: ChangeDetectorRef) {}

  /**
   * ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ОТРИСОВКИ
   *
   * ЧТО ДЕЛАЕТ:
   * - Проверяет, нужны ли кнопки развертывания для описания и навыков
   * - Сравнивает высоту контента с высотой контейнера
   * - Устанавливает флаги для показа кнопок "Показать полностью"
   * - Запускает обнаружение изменений для обновления UI
   */
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

  /**
   * РАЗВЕРТЫВАНИЕ/СВЕРТЫВАНИЕ ОПИСАНИЯ
   *
   * ЧТО ПРИНИМАЕТ:
   * @param elem - DOM элемент для анимации
   * @param expandedClass - CSS класс для развернутого состояния
   * @param isExpanded - текущее состояние (развернуто/свернуто)
   *
   * ЧТО ДЕЛАЕТ:
   * - Переключает визуальное состояние описания
   * - Применяет анимацию развертывания/свертывания
   * - Обновляет флаг состояния
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  /**
   * РАЗВЕРТЫВАНИЕ/СВЕРТЫВАНИЕ СПИСКА НАВЫКОВ
   *
   * ЧТО ПРИНИМАЕТ:
   * @param elem - DOM элемент для анимации
   * @param expandedClass - CSS класс для развернутого состояния
   * @param isExpanded - текущее состояние (развернуто/свернуто)
   *
   * ЧТО ДЕЛАЕТ:
   * - Переключает визуальное состояние списка навыков
   * - Применяет анимацию развертывания/свертывания
   * - Обновляет флаг состояния
   */
  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }
}
