/** @format */

import { CommonModule, DatePipe } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { FileUploadItemComponent } from "@ui/components/file-upload-item/file-upload-item.component";
import { InputComponent, ButtonComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { BadgeComponent } from "@ui/components/badge/badge.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe, PluralizePipe } from "@corelib";
import { expandElement } from "@utils/expand-element";
import { IconComponent } from "@uilib";
import { nanoid } from "nanoid";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { priorityInfoList } from "projects/core/src/consts/lists/priority-info-list.const";
import { ClickOutsideModule } from "ng-click-outside";
import { actionTypeList } from "projects/core/src/consts/lists/actiion-type-list.const";
import { Project } from "@office/models/project.model";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SkillsService } from "@office/services/skills.service";
import { Skill } from "@office/models/skill";
import { Subscription } from "rxjs";
import { TaskDetail } from "../../../models/task.model";
import { daysUntil } from "@utils/days-untit";
import { KanbanBoardService } from "../../../kanban-board.service";

@Component({
  selector: "app-task-detail",
  templateUrl: "./task-detail.component.html",
  styleUrl: "./task-detail.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadItemComponent,
    InputComponent,
    IconComponent,
    FileItemComponent,
    TextareaComponent,
    TagComponent,
    BadgeComponent,
    AvatarComponent,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    DatePipe,
    DropdownComponent,
    ClickOutsideModule,
    SkillsGroupComponent,
    ModalComponent,
    ControlErrorPipe,
    PluralizePipe,
  ],
  standalone: true,
})
export class TaskDetailComponent implements OnInit, AfterViewInit {
  @Input() collaborators?: Project["collaborators"];
  @Input() goals?: Project["goals"];

  @ViewChild("descEl") descEl?: ElementRef;

  private readonly kanbanBoardService = inject(KanbanBoardService);
  private readonly skillsService = inject(SkillsService);
  private readonly cdRef = inject(ChangeDetectorRef);

  constructor(private readonly fb: FormBuilder) {
    this.taskDetailForm = this.fb.group({
      title: ["", Validators.required],
      responsible: [],
      performers: this.fb.array([]),
      startDate: [null],
      deadline: [null],
      tags: this.fb.array([]),
      goal: [null],
      skills: this.fb.array([]),
      description: [null],
      files: this.fb.array([]),
      priority: [null],
      action: [null],
    });
  }

  isChangeDescriptionText = signal<boolean>(false);

  remainingDaysDeadline = signal<number>(0);

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  descriptionExpandable!: boolean; // Флаг необходимости кнопки "подробнее"
  readFullDescription = false; // Флаг показа всех вакансий

  isActionTypeOpen = false;
  isPriorityTypeOpen = false;
  isDeleteTypeOpen = false;
  isResponsiblePickOpen = false;
  isPerformersPickOpen = false;
  isGoalPickOpen = false;
  isTagsPickOpen = false;

  showEditAvatarIcon = false;
  showEditDeadlineDatePicker = false;
  showEditStartDatePicker = false;

  skillsGroupsModalOpen = signal(false);
  nestedSkills$ = this.skillsService.getSkillsNested();
  openGroupIds = new Set<number>();

  filesList: any[] = [];

  taskDetailForm: FormGroup;

  subscriptions: Subscription[] = [];

  get actionTypeOptions() {
    return actionTypeList;
  }

  get priorityTypeOptions() {
    return priorityInfoList
      .map(priority => ({
        id: priority.id,
        label: priority.label,
        value: priority.priorityType,
        additionalInfo: priority.priorityType.toString(),
      }))
      .reverse();
  }

  get responsiblePickOpenOptions() {
    return this.collaborators
      ? this.collaborators.map(collaborator => ({
          id: collaborator.userId,
          label: collaborator.firstName + " " + collaborator.lastName[0],
          value: collaborator.userId,
          additionalInfo: collaborator.avatar,
        }))
      : [];
  }

  get goalPickOptions() {
    return this.goals
      ? this.goals.map((goal, index) => ({
          id: index,
          label: goal.title,
          value: goal.id,
          additionalInfo: goal.title,
        }))
      : [];
  }

  get tagsPickOptions() {
    return [
      {
        id: 1,
        label: "аналитика",
        value: "аналитика",
        additionalInfo: "primary",
      },
      {
        id: 2,
        label: "продажи",
        value: "продажи",
        additionalInfo: "complete",
      },
    ];
  }

  get priorityDeleteOptions() {
    return [
      {
        id: 1,
        label: "удалить задачу",
        value: "delete",
      },
    ];
  }

  get hasOpenSkillsGroups(): boolean {
    return this.openGroupIds.size > 0;
  }

  get statusOfTask() {
    const start = new Date(this.taskDetailForm.value.startDate);
    const deadline = new Date(this.taskDetailForm.value.deadline);

    const status = this.getTaskStatus(start, deadline);

    let days: number | null = null;

    if (status === "ожидание") {
      days = daysUntil(start);
    } else if (status === "началась") {
      days = daysUntil(deadline);
    }

    const color = status === "закончена" ? "red" : this.getColorByDays(days!);

    return {
      text: status,
      color,
    };
  }

  ngOnInit(): void {}

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    this.initializeTaskDetailInfo(todayDate, tomorrowDate);
    this.checkDescriptionHeigth();
  }

  onDeleteTaskGoal(): void {}

  onDeleteTaskTag(): void {}

  onEditTaskTag(): void {}

  getCreatedTagInfo(createdTagInfo: { name: string; color: string }): void {
    console.log(createdTagInfo);
  }

  toggleDropdown(
    type: "action" | "priority" | "responsible" | "performers" | "goal" | "tags" | "delete",
    state: boolean
  ) {
    switch (type) {
      case "action":
        this.isActionTypeOpen = state;
        break;

      case "priority":
        this.isPriorityTypeOpen = state;
        break;

      case "responsible":
        this.isResponsiblePickOpen = state;
        break;

      case "performers":
        this.isPerformersPickOpen = state;
        break;

      case "goal":
        this.isGoalPickOpen = state;
        break;

      case "tags":
        this.isTagsPickOpen = state;
        break;

      case "delete":
        this.isDeleteTypeOpen = state;
        break;

      default:
        break;
    }
  }

  onTypeSelect(
    typeId: number,
    type: "action" | "priority" | "responsible" | "performers" | "goal" | "tags" | "delete"
  ): void {
    this.toggleDropdown(type, false);
    console.log(typeId);
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

  /** Обработчик загрузки файла */
  onUpdate(event: Event): void {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }

    console.log("123");

    // this.loading = true;

    // this.fileService.uploadFile(files[0]).subscribe(res => {
    //   this.loading = false;

    //   this.value = res.url;
    //   this.onChange(res.url);
    // });
  }

  /**
   * Переключение навыка в списке выбранных
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.taskDetailForm.value;
    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.openGroupIds.clear();
    if (isOpen) {
      this.openGroupIds.add(skillsGroupId);
    }

    this.cdRef.markForCheck();
  }

  /**
   * Переключение модального окна групп навыков
   */
  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  /**
   * Добавление навыка
   * @param newSkill - новый навык
   */
  private onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.taskDetailForm.value;
    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.taskDetailForm.patchValue({ skills: [newSkill, ...skills] });
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
  private onRemoveSkill(oddSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.taskDetailForm.value;

    this.taskDetailForm.patchValue({
      skills: skills.filter(skill => skill.id !== oddSkill.id),
    });
  }

  private checkDescriptionHeigth(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  private initializeTaskDetailInfo(todayDate: Date, tommorowDate: Date): void {
    const taskDetailInfo$ = this.kanbanBoardService.getTaskById(123).subscribe({
      next: (taskDetailInfo: TaskDetail) => {
        this.taskDetailForm.patchValue({
          title: taskDetailInfo.title ?? "Настроить процессы",
          responsible: taskDetailInfo.responsible ?? null,
          performers: taskDetailInfo.performers ?? [],
          startDate: taskDetailInfo.dateTaskStart ?? todayDate,
          deadline: taskDetailInfo.deadlineDate
            ? new Date(taskDetailInfo.deadlineDate)
            : tommorowDate,
          tags: taskDetailInfo.tags ?? [],
          goal: taskDetailInfo.goal ?? null,
          skills: taskDetailInfo.requiredSkills ?? [],
          description: taskDetailInfo.description ?? null,
          files: taskDetailInfo.files ?? [],
        });
        this.remainingDaysDeadline.set(
          daysUntil(
            taskDetailInfo.deadlineDate
              ? new Date(taskDetailInfo.deadlineDate)
              : new Date(tommorowDate)
          )
        );
      },
    });

    this.subscriptions.push(taskDetailInfo$);
  }

  private getColorByDays(days: number): "red" | "gold" | "green" {
    if (days <= 3) return "red";
    if (days <= 7) return "gold";
    return "green";
  }

  private getTaskStatus(start: Date, deadline: Date) {
    const now = new Date();

    if (now < start) return "ожидание";
    if (now > deadline) return "закончена";
    return "началась";
  }
}
