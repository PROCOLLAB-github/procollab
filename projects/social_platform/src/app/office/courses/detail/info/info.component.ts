/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { map } from "rxjs";
import { CommonModule } from "@angular/common";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ButtonComponent } from "@ui/components";
import { CourseModuleCardComponent } from "@office/courses/shared/course-module-card/course-module-card.component";
import { CourseDetail, CourseStructure } from "@office/models/courses.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Компонент детальной информации о траектории
 * Отображает полную информацию о выбранной траектории пользователя:
 * - Основную информацию (название, изображение, описание)
 * - Временную шкалу траектории
 * - Информацию о наставнике
 * - Навыки (персональные, текущие, будущие, пройденные)
 *
 * Поддерживает навигацию к отдельным навыкам и взаимодействие с наставником
 */
@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    CommonModule,
    SoonCardComponent,
    ModalComponent,
    ButtonComponent,
    CourseModuleCardComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit, AfterViewInit {
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly cdRef = inject(ChangeDetectorRef);

  protected readonly courseStructure = signal<CourseStructure | undefined>(undefined);
  protected readonly courseDetail = signal<CourseDetail | undefined>(undefined);
  protected readonly isCompleteModule = signal<boolean>(false);
  protected readonly isCourseCompleted = signal<boolean>(false);

  /**
   * Инициализация компонента
   * Загружает данные траектории, пользовательскую информацию и настраивает навыки
   */
  ngOnInit(): void {
    this.route.parent?.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([courseDetail, courseStructure]: [CourseDetail, CourseStructure]) => {
        this.courseStructure.set(courseStructure);
        this.courseDetail.set(courseDetail);

        const completedModuleIds = courseStructure.modules
          .filter(m => m.progressStatus === "completed")
          .map(m => m.id);

        const unseenModule = completedModuleIds.find(
          id =>
            !localStorage.getItem(`course_${courseStructure.courseId}_module_${id}_complete_seen`)
        );

        if (unseenModule) {
          const allModulesCompleted = courseStructure.modules.every(
            m => m.progressStatus === "completed"
          );
          this.isCourseCompleted.set(allModulesCompleted);
          this.isCompleteModule.set(true);
          localStorage.setItem(
            `course_${courseStructure.courseId}_module_${unseenModule}_complete_seen`,
            "true"
          );
        }
      });
  }

  protected descriptionExpandable?: boolean;
  protected readFullDescription!: boolean;

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
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
