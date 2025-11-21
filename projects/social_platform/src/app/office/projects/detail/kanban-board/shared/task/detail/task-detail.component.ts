/** @format */

import { CommonModule, DatePipe } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
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
import { getPriorityType } from "@utils/helpers/getPriorityType";
import { getActionType } from "@utils/helpers/getActionType";
import { ActivatedRoute } from "@angular/router";
import { TagData } from "../../create-tag-form/create-tag-form.component";
import { FileService } from "@core/services/file.service";

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

  private readonly skillsService = inject(SkillsService);
  private readonly kanbanBoardService = inject(KanbanBoardService);
  private readonly fileService = inject(FileService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);

  constructor(private readonly fb: FormBuilder) {
    this.taskDetailForm = this.fb.group({
      title: ["", Validators.required],
      responsible: [],
      performers: [],
      startDate: [null],
      deadline: [null],
      tags: [[]],
      goal: [null],
      skills: [[]],
      description: [null],
      files: [[]],
      priority: [null],
      status: [null],
      action: [null],
      score: [null],
      tagsLib: [[]],
    });
  }

  isChangeDescriptionText = signal<boolean>(false);

  remainingDaysDeadline = signal<number>(0);

  editingTag: TagData | null = null;

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

  creatingTag = false;
  loadingFile = false;

  showEditAvatarIcon = false;
  showEditDeadlineDatePicker = false;
  showEditStartDatePicker = false;
  showChangeGoalModal = false;

  skillsGroupsModalOpen = signal(false);
  nestedSkills$ = this.skillsService.getSkillsNested();
  openGroupIds = new Set<number>();
  openGroupIndex: number | null = null;

  filesList: any[] = [];

  taskDetailForm: FormGroup;

  getPriorityType = getPriorityType;
  getActionType = getActionType;

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
      ? this.goals.map(goal => ({
          id: goal.id,
          label: goal.title,
          value: goal.id,
          additionalInfo: goal.title,
        }))
      : [];
  }

  get tagsPickOptions() {
    const tagsLib = this.taskDetailForm.get("tagsLib")?.value || [];
    return [...tagsLib];
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
    return this.openGroupIndex !== null;
  }

  get selectedSkills(): Skill[] {
    return this.taskDetailForm.getRawValue().skills || [];
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

  ngOnInit(): void {
    this.taskDetailForm.valueChanges.subscribe({
      next: value => {
        console.log(value);
      },
    });
  }

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

  onDeleteTaskGoal(): void {
    this.taskDetailForm.patchValue({ goal: null });
    this.isGoalPickOpen = false;
  }

  onDeleteTaskTag(tagId: number): void {
    const tags = this.taskDetailForm.get("tags")?.value || [];

    const remainingTags = tags.filter((tag: any) => tag.id !== tagId);
    this.taskDetailForm.patchValue({ tags: remainingTags });

    this.isTagsPickOpen = false;
  }

  onEditTaskTag(tagId: number): void {
    this.isTagsPickOpen = !this.isTagsPickOpen;
    this.creatingTag = true;

    const tags = this.taskDetailForm.get("tags")?.value || [];
    const tag = tags.find((t: any) => t.id === tagId);

    if (tag) {
      this.editingTag = {
        id: tag.id,
        name: tag.title,
        color: tag.color,
      };
    }
  }

  onUpdateTag({ id, name, color }: TagData): void {
    const tagsLib = [...(this.taskDetailForm.get("tagsLib")?.value || [])];
    const libIndex = tagsLib.findIndex((t: any) => t.id === id);

    if (libIndex !== -1) {
      tagsLib[libIndex] = {
        ...tagsLib[libIndex],
        label: name,
        value: name,
        additionalInfo: color,
      };

      this.taskDetailForm.patchValue({ tagsLib: [...tagsLib] });
    }

    const tags = [...(this.taskDetailForm.get("tags")?.value || [])];
    const tagIndex = tags.findIndex((t: any) => t.id === id);

    if (tagIndex !== -1) {
      tags[tagIndex] = {
        ...tags[tagIndex],
        title: name,
        color,
      };
      this.taskDetailForm.patchValue({ tags: [...tags] });
    }

    this.editingTag = null;
    this.creatingTag = false;
  }

  createTag({ name, color }: { name: string; color: string }): void {
    const { tagsLib } = this.taskDetailForm.value;
    const tagInfo = { id: tagsLib.length + 1, label: name, value: name, additionalInfo: color };
    tagsLib.push(tagInfo);
  }

  onTypeSelect(
    type: "action" | "priority" | "responsible" | "performers" | "goal" | "tags" | "delete",
    state: boolean,
    typeId?: number
  ) {
    switch (type) {
      case "action":
        this.isActionTypeOpen = state;
        this.taskDetailForm.patchValue({ action: typeId });
        break;

      case "priority":
        this.isPriorityTypeOpen = state;
        this.taskDetailForm.patchValue({ priority: typeId });
        break;

      case "responsible": {
        this.isResponsiblePickOpen = state;

        if (typeId !== undefined) {
          if (!this.collaborators) return;

          const responsible = this.collaborators.find(
            collaborator => collaborator.userId === typeId
          );
          this.taskDetailForm.patchValue({
            responsible: {
              id: responsible?.userId,
              avatar: responsible?.avatar,
              name: responsible?.firstName + " " + responsible?.lastName[0],
            },
          });
        }
        break;
      }

      case "performers": {
        this.isPerformersPickOpen = state;

        if (typeId !== undefined) {
          if (!this.collaborators) return;

          const collaborator = this.collaborators.find(
            collaborator => collaborator.userId === typeId
          );
          const currentPerformers = this.taskDetailForm.get("performers")?.value || [];
          const payload = {
            id: collaborator?.userId,
            avatar: collaborator?.avatar,
            name: collaborator?.firstName + " " + collaborator?.lastName[0],
          };

          if (currentPerformers.some((performer: any) => performer.id === payload.id)) return;

          this.taskDetailForm.patchValue({
            performers: [...currentPerformers, payload],
          });
        }
        break;
      }

      case "goal": {
        this.isGoalPickOpen = state;

        if (typeId !== undefined) {
          if (!this.goals) return;

          const goal = this.goals.find(goal => goal.id === typeId);
          if (goal) this.taskDetailForm.patchValue({ goal: { id: goal.id, title: goal.title } });
        }

        break;
      }

      case "tags": {
        this.isTagsPickOpen = state;

        if (!state) {
          this.editingTag = null;
          this.creatingTag = false;
        }

        if (typeId !== undefined) {
          const tag = this.tagsPickOptions.find((tag: any) => tag.id === typeId);
          const payload = { id: tag?.id, title: tag?.label, color: tag?.additionalInfo };

          const currentTags = this.taskDetailForm.get("tags")?.value || [];
          if (currentTags.some((tag: any) => tag.id === payload.id)) return;
          this.taskDetailForm.patchValue({ tags: [...currentTags, payload] });
        } else {
          this.editingTag = null;
          this.creatingTag = false;
        }

        break;
      }

      case "delete":
        this.isDeleteTypeOpen = state;
        break;

      default:
        break;
    }
  }

  onChangeText(event: MouseEvent): void {
    event.stopPropagation();
    this.isChangeDescriptionText.set(false);

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
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.loadingFile = true;

    this.fileService.uploadFile(file).subscribe(url => {
      const currentFiles = this.taskDetailForm.get("files")?.value || [];

      const newFile = {
        name: file.name.split,
        link: url,
        extension: file.type,
        size: file.size,
      };

      this.taskDetailForm.get("files")?.setValue([...currentFiles, newFile]);
      input.value = "";

      this.loadingFile = false;
    });
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
      if (skills.length < 3) {
        this.onAddSkill(toggledSkill);
      }
    }
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.openGroupIndex = isOpen ? skillsGroupId : null;
    this.cdRef.markForCheck();
  }

  isGroupDisabled(skillsGroupId: number): boolean {
    return this.openGroupIndex !== null && this.openGroupIndex !== skillsGroupId;
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
    this.cdRef.markForCheck();
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
    this.cdRef.markForCheck();
  }

  private checkDescriptionHeigth(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  private initializeTaskDetailInfo(todayDate: Date, tommorowDate: Date): void {
    const taskId = this.route.snapshot.queryParams["taskId"];
    const taskDetailInfo$ = this.kanbanBoardService.getTaskById(taskId).subscribe({
      next: (taskDetailInfo: TaskDetail) => {
        this.taskDetailForm.patchValue({
          title: taskDetailInfo.title ?? "",
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
