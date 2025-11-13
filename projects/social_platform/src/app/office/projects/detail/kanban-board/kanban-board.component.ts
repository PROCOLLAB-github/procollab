/** @format */

import { CommonModule, DatePipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { ProjectDataService } from "../services/project-data.service";
import { Project } from "@office/models/project.model";
import { KanbanBoardSidebarComponent } from "./shared/sidebar/kanban-board-sidebar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent, ButtonComponent, InputComponent } from "@ui/components";
import { KanbanTaskComponent } from "./shared/task/kanban-task.component";
import { ClickOutsideModule } from "ng-click-outside";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { expandElement } from "@utils/expand-element";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { BadgeComponent } from "@ui/components/badge/badge.component";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban-board.component.html",
  styleUrl: "./kanban-board.component.scss",
  imports: [
    CommonModule,
    KanbanBoardSidebarComponent,
    IconComponent,
    KanbanTaskComponent,
    ClickOutsideModule,
    ButtonComponent,
    AvatarComponent,
    TagComponent,
    ParseBreaksPipe,
    ParseLinksPipe,
    FileItemComponent,
    InputComponent,
    FileUploadItemComponent,
    ReactiveFormsModule,
    DatePipe,
    TextareaComponent,
    BadgeComponent,
  ],
  standalone: true,
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly projectDataService = inject(ProjectDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);
  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder) {
    this.taskDetailForm = this.fb.group({
      title: ["", Validators.required],
      responsible: [null],
      performers: this.fb.array([]),
      startDate: [null],
      deadline: [null],
      tags: this.fb.array([]),
      goal: [null],
      skills: this.fb.array([]),
      description: [null],
      files: this.fb.array([]),
    });
  }

  projectBoardInfo = signal<Project | null>(null);
  boardColumns = signal<any[]>([]);
  isTaskDetailOpen = signal<boolean>(false);
  isChangeDescriptionText = signal<boolean>(false);

  descriptionExpandable!: boolean; // Флаг необходимости кнопки "Читать полностью"
  readFullDescription = false; // Флаг показа всех вакансий

  filesList: any[] = [];

  todayDate = new Date();
  tommorowDate = new Date().setDate(this.todayDate.getDate() + 1);

  taskDetailForm: FormGroup;

  ngOnInit(): void {
    const detailInfoUrl$ = this.route.queryParams.subscribe({
      next: params => {
        if (params["taskId"]) {
          this.isTaskDetailOpen.set(true);
        }
      },
    });

    this.subscriptions.push(detailInfoUrl$);

    const projectInfo$ = this.projectDataService.project$.subscribe({
      next: project => {
        if (project) {
          this.projectBoardInfo.set(project);
        }
      },
    });

    this.subscriptions.push(projectInfo$);

    const mockColumns = [
      {
        id: 0,
        name: "бэклог",
        locked: true,
        tasks: [
          {
            id: 1,
            title: "собрать требования",
            description:
              "Сейчас, чтобы создался аккаунт внтури скиллз, пользователю обязательно надо войти внутрь вкладки траектории и еще раз залогиниться...",
            priority: 3,
          },
          { id: 2, title: "создать дизайн макеты" },
        ],
      },
      {
        id: 1,
        locked: false,
        name: "в работе",
        tasks: [
          { id: 3, title: "настроить API" },
          { id: 4, title: "подключить WebSocket" },
        ],
      },
      {
        id: 2,
        locked: false,
        name: "Готово",
        tasks: [
          { id: 5, title: "верстка страницы входа" },
          { id: 6, title: "настроить Dockerfile" },
        ],
      },
    ];

    this.boardColumns.set(mockColumns);
  }

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    this.checkDescriptionHeigth();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  openDetailTask(taskId: number): void {
    this.router.navigate([], {
      queryParams: {
        taskId,
      },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
    this.isTaskDetailOpen.set(true);
  }

  closeDetailTask(): void {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
    this.isTaskDetailOpen.set(false);
  }

  onChangeText(event: MouseEvent): void {
    event.stopPropagation();
    this.isChangeDescriptionText.set(!this.isChangeDescriptionText());

    setTimeout(() => this.checkDescriptionHeigth(), 0);
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

  private checkDescriptionHeigth(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }
}
