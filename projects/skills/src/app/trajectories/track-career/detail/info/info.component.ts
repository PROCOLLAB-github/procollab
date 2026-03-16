/** @format */

import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  inject,
  type OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { map, type Observable, type Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import type { Trajectory, UserTrajectory } from "projects/skills/src/models/trajectory.model";
import { TrajectoriesService } from "../../../trajectories.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";
import { SkillCardComponent } from "projects/skills/src/app/shared/skill-card/skill-card.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ButtonComponent } from "@ui/components";

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
    SkillCardComponent,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit, AfterViewInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  cdRef = inject(ChangeDetectorRef);

  trajectoryService = inject(TrajectoriesService);
  breakpointObserver = inject(BreakpointObserver);

  subscriptions$: Subscription[] = [];

  trajectory!: Trajectory;
  userTrajectory = signal<UserTrajectory | null>(null);

  isCompleteModule = signal<boolean>(false);

  @ViewChild("descEl") descEl?: ElementRef;

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  /**
   * Инициализация компонента
   * Загружает данные траектории, пользовательскую информацию и настраивает навыки
   */
  ngOnInit(): void {
    this.desktopMode$.subscribe(_ => {});

    this.route.parent?.data.pipe(map(r => r["data"])).subscribe(r => {
      this.trajectory = r[0];
      this.userTrajectory.set({ ...r[1], individualSkills: r[2] });
      this.isCompleteModule.set(this.userTrajectory()!.completedSkills.some(skill => skill.isDone));
    });
  }

  descriptionExpandable?: boolean;
  readFullDescription!: boolean;

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
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

  /**
   * Обработчик клика по навыку
   * Устанавливает ID навыка в сервисе и переходит к странице навыка
   * @param skillId - ID выбранного навыка
   */
  onSkillClick(skillId: number) {
    this.router.navigate(["skills", skillId]);
  }
}
