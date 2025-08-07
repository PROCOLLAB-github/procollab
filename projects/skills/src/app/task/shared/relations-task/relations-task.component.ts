/** @format */

import {
  Component,
  type OnInit,
  type AfterViewInit,
  type OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  type QueryList,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { fromEvent, type Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import type {
  ConnectQuestion,
  ConnectQuestionRequest,
  ConnectQuestionResponse,
} from "../../../../models/step.model";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";

/**
 * Компонент задачи на установление связей
 * Позволяет пользователю соединять элементы из левого столбца с элементами правого столбца
 *
 * Входные параметры:
 * @Input data - данные вопроса типа ConnectQuestion
 * @Input hint - текст подсказки
 * @Input success - флаг успешного выполнения
 * @Input error - объект ошибки для сброса состояния
 *
 * Выходные события:
 * @Output update - событие обновления с массивом связей
 *
 * Функциональность:
 * - Отображает два столбца элементов для соединения
 * - Рисует SVG линии между связанными элементами
 * - Поддерживает текстовые и графические элементы
 * - Автоматически перерисовывает линии при изменении размера окна
 */
@Component({
  selector: "app-relations-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe, ParseLinksPipe],
  templateUrl: "./relations-task.component.html",
  styleUrls: ["./relations-task.component.scss"],
})
export class RelationsTaskComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) data!: ConnectQuestion; // Данные вопроса
  @Input() hint!: string; // Текст подсказки
  @Input() success = false; // Флаг успешного выполнения

  // Сеттер для обработки ошибок и сброса состояния
  @Input()
  set error(error: ConnectQuestionResponse | null) {
    this._error.set(error);

    if (error !== null) {
      this.result.set([]); // Сбрасываем результат при ошибке
      this.selectedLeftId.set(null); // Сбрасываем выбранный элемент
    }
  }

  get error() {
    return this._error();
  }

  protected readonly Array = Array;

  _error = signal<ConnectQuestionResponse | null>(null);

  @Output() update = new EventEmitter<ConnectQuestionRequest>(); // Событие обновления связей

  // Ссылки на DOM элементы
  @ViewChild("svgOverlay", { static: true }) svgOverlay!: ElementRef<SVGSVGElement>;
  @ViewChildren("leftItem", { read: ElementRef }) leftItems!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren("rightItem", { read: ElementRef }) rightItems!: QueryList<ElementRef<HTMLElement>>;

  private resizeSub!: Subscription; // Подписка на изменение размера окна

  // Состояние компонента
  result = signal<ConnectQuestionRequest>([]); // Массив установленных связей
  resultLeft = computed(() => this.result().map(r => r.leftId)); // ID связанных левых элементов
  resultRight = computed(() => this.result().map(r => r.rightId)); // ID связанных правых элементов
  selectedLeftId = signal<number | null>(null); // ID выбранного левого элемента

  description!: any; // Обработанное описание
  sanitizer = inject(DomSanitizer);

  // Проверяет, является ли правый столбец сеткой изображений
  get isImageGrid() {
    return this.data.connectRight.every(itm => !!itm.file);
  }

  ngOnInit() {
    // Безопасно обрабатываем HTML в описании
    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }

  ngAfterViewInit() {
    // Подписываемся на изменение размера окна для перерисовки линий
    this.resizeSub = fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => this.drawLines());

    // Рисуем линии после инициализации представления
    setTimeout(() => this.drawLines());
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
  }

  /**
   * Обработчик выбора элемента из левого столбца
   * @param id - ID выбранного элемента
   */
  onSelectLeft(id: number) {
    const current = this.selectedLeftId();

    // Если элемент уже выбран, снимаем выбор
    if (current === id) {
      this.selectedLeftId.set(null);
      return;
    }

    // Если элемент уже связан, удаляем связь
    const existingIndex = this.result().findIndex(r => r.leftId === id);
    if (existingIndex !== -1) {
      this.result.update(r => r.filter((_, i) => i !== existingIndex));
      this.drawLines();
      this.update.emit(this.result());
    }

    this.selectedLeftId.set(id);
  }

  /**
   * Обработчик выбора элемента из правого столбца
   * Создает связь между выбранным левым и правым элементами
   * @param id - ID выбранного правого элемента
   */
  onSelectRight(id: number) {
    const leftId = this.selectedLeftId();
    if (leftId === null) return;

    // Удаляем существующие связи для этих элементов
    let newResult = this.result().filter(r => r.leftId !== leftId && r.rightId !== id);

    // Добавляем новую связь
    newResult = [...newResult, { leftId, rightId: id }];

    this.result.set(newResult);
    this.selectedLeftId.set(null);

    this.drawLines();
    this.update.emit(this.result());
  }

  /**
   * Удаляет все SVG линии
   */
  removeLines() {
    const svgEl = this.svgOverlay.nativeElement;
    while (svgEl.firstChild) {
      svgEl.removeChild(svgEl.firstChild);
    }
  }

  /**
   * Рисует SVG линии между связанными элементами
   * Вычисляет позиции элементов и создает линии между ними
   */
  private drawLines() {
    this.removeLines();

    const svgEl = this.svgOverlay.nativeElement;
    const svgRect = svgEl.getBoundingClientRect();

    // Получаем позиции левых элементов
    const leftPositions = new Map<number, DOMRect>();
    this.leftItems.forEach(el => {
      const id = Number(el.nativeElement.dataset["id"]);
      leftPositions.set(id, el.nativeElement.getBoundingClientRect());
    });

    // Получаем позиции правых элементов
    const rightPositions = new Map<number, DOMRect>();
    this.rightItems.forEach(el => {
      const id = Number(el.nativeElement.dataset["id"]);
      rightPositions.set(id, el.nativeElement.getBoundingClientRect());
    });

    // Рисуем линии для каждой связи
    this.result().forEach(pair => {
      const leftRect = leftPositions.get(pair.leftId);
      const rightRect = rightPositions.get(pair.rightId);

      if (!leftRect || !rightRect) return;

      // Вычисляем координаты линии
      const x1 = leftRect.right - svgRect.left;
      const y1 = leftRect.top + leftRect.height / 2 - svgRect.top;
      const x2 = rightRect.left - svgRect.left;
      const y2 = rightRect.top + rightRect.height / 2 - svgRect.top;

      // Создаем SVG линию
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1.toString());
      line.setAttribute("y1", y1.toString());
      line.setAttribute("x2", x2.toString());
      line.setAttribute("y2", y2.toString());
      line.setAttribute("stroke", "#6B46C1");
      line.setAttribute("stroke-width", "4");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("class", "connection-line");

      svgEl.appendChild(line);
    });
  }
}
