/** @format */

import { CommonModule } from "@angular/common";
import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  inject,
  Input,
  type OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TrajectoriesService } from "../../../trajectories.service";
import { DomSanitizer } from "@angular/platform-browser";
import { expandElement } from "@utils/expand-element";
import { IconComponent } from "@uilib";
import { ParseBreaksPipe, ParseLinksPipe, PluralizePipe } from "@corelib";
import { Trajectory } from "projects/skills/src/models/trajectory.model";
import { HttpErrorResponse } from "@angular/common/http";
import { BreakpointObserver } from "@angular/cdk/layout";
import { map, Observable } from "rxjs";
import { trajectoryMoreList } from "projects/core/src/consts/lists/trajectory-more-list.const";

/**
 * Компонент отображения карточки траектории
 * Показывает информацию о траектории: название, описание, навыки, длительность
 * Поддерживает различные модальные окна для взаимодействия с пользователем
 * Обрабатывает выбор траектории и навигацию к детальной информации
 *
 * @Input trajectory - объект траектории для отображения
 */
@Component({
  selector: "app-trajectory",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ModalComponent,
    IconComponent,
    RouterModule,
    ParseLinksPipe,
    PluralizePipe,
    ParseBreaksPipe,
  ],
  templateUrl: "./trajectory.component.html",
  styleUrl: "./trajectory.component.scss",
})
export class TrajectoryComponent implements AfterViewInit, OnInit {
  @Input() trajectory!: Trajectory;
  protected readonly dotsArray = Array;
  protected readonly trajectoryMore = trajectoryMoreList;

  router = inject(Router);
  trajectoryService = inject(TrajectoriesService);
  breakpointObserver = inject(BreakpointObserver);

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  cdRef = inject(ChangeDetectorRef);
  sanitizer = inject(DomSanitizer);

  @ViewChild("descEl") descEl?: ElementRef;

  descriptionExpandable!: boolean;
  readFullDescription = false;

  currentPage = 1;

  // Состояния модальных окон
  moreModalOpen = signal(false);
  confirmModalOpen = signal(false);
  nonConfirmerModalOpen = signal(false);
  instructionModalOpen = signal(false);
  activatedModalOpen = signal(false);

  type = signal<"all" | "my" | null>(null);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  /**
   * Инициализация компонента
   * Определяет тип отображения (all/my) на основе текущего URL
   */
  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "all" | "my");
  }

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  /**
   * Обработчик клика по кнопке "Выбрать"
   * Активирует траекторию и обрабатывает различные сценарии ответа сервера
   */
  onOpenConfirmClick() {
    this.trajectoryService.activateTrajectory(this.trajectory.id).subscribe({
      next: () => {
        if (!this.trajectory.isActiveForUser) {
          this.confirmModalOpen.set(true);
        }
      },
      error: err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 403) {
            this.nonConfirmerModalOpen.set(true);
          } else if (err.status === 400) {
            this.activatedModalOpen.set(true);
            this.nonConfirmerModalOpen.set(false);
            this.instructionModalOpen.set(false);
            this.confirmModalOpen.set(false);
          }
        }
      },
    });
  }

  /**
   * Подтверждение выбора траектории
   * Закрывает модальное окно подтверждения и открывает инструкции
   */
  onConfirmClick() {
    this.confirmModalOpen.set(false);
    this.instructionModalOpen.set(true);
  }

  /**
   * Переход к предыдущей странице инструкций
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  /**
   * Переход к следующей странице инструкций или к траектории
   */
  nextPage(): void {
    if (this.currentPage === 4) {
      this.navigateOnTrajectory();
    } else if (this.currentPage < 4) {
      this.currentPage += 1;
    }
  }

  /**
   * Навигация к детальной странице траектории
   */
  navigateOnTrajectory() {
    this.router.navigate(["/trackCar/" + this.trajectory.id]).catch(err => {
      if (err.status === 403) {
        this.nonConfirmerModalOpen.set(true);
      }
    });
  }

  /**
   * Закрытие модального окна активной траектории и переход к ней
   * @param trajectoryId - ID траектории для перехода
   */
  onCloseModalActiveTrajectory(trajectoryId: number | string) {
    this.activatedModalOpen.set(false);
    this.router.navigate([`/trackCar/${trajectoryId}`]);
  }

  /**
   * Переключение развернутого/свернутого состояния описания
   * @param elem - HTML элемент описания
   * @param expandedClass - CSS класс для развернутого состояния
   * @param isExpanded - текущее состояние (развернуто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
