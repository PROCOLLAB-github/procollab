/** @format */

import { CommonModule, DatePipe } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { InputComponent, ButtonComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { BadgeComponent } from "@ui/components/badge/badge.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  ControlErrorPipe,
  ParseBreaksPipe,
  ParseLinksPipe,
  PluralizePipe,
  ValidationService,
} from "@corelib";
import { expandElement } from "@utils/expand-element";
import { IconComponent } from "@uilib";
import { nanoid } from "nanoid";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { priorityInfoList } from "projects/core/src/consts/lists/priority-info-list.const";
import { ClickOutsideModule } from "ng-click-outside";
import { actionTypeList } from "projects/core/src/consts/lists/actiion-type-list.const";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SkillsService } from "@office/services/skills.service";
import { Skill } from "@office/models/skill";
import { map, Subscription } from "rxjs";
import { TaskDetail } from "../../../models/task.model";
import { daysUntil } from "@utils/days-untit";
import { KanbanBoardService } from "../../../services/kanban-board.service";
import { getPriorityType } from "@utils/helpers/getPriorityType";
import { getActionType } from "@utils/helpers/getActionType";
import { ActivatedRoute } from "@angular/router";
import { FileService } from "@core/services/file.service";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { ErrorMessage } from "@error/models/error-message";
import { SnackbarService } from "@ui/services/snackbar.service";
import { ChatMessage } from "@office/models/chat-message.model";
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from "@angular/cdk/scrolling";
import { TagDto } from "../../../models/dto/tag.model.dto";
import { PerformerDto } from "../../../models/dto/performer.model.dto";
import { KanbanBoardDetailInfoService } from "../../../services/kanban-board-detail-info.service";
import { ProjectDataService } from "@office/projects/detail/services/project-data.service";

@Component({
  selector: "app-task-detail",
  templateUrl: "./task-detail.component.html",
  styleUrl: "./task-detail.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    UploadFileComponent,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
  ],
  standalone: true,
})
export class TaskDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() delete = new EventEmitter<void>();

  @ViewChild("descEl") descEl?: ElementRef;
  /** Ссылка на viewport для автопрокрутки */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  private readonly skillsService = inject(SkillsService);
  private readonly kanbanBoardService = inject(KanbanBoardService);
  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);
  private readonly projectDataService = inject(ProjectDataService);
  private readonly fileService = inject(FileService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly validationService = inject(ValidationService);
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
      type: [null],
      score: [null],
      tagsLib: [[]],
    });

    this.sendResultForm = this.fb.group({
      description: ["", Validators.required, Validators.maxLength(200)],
      accompanyingFile: ["", Validators.required],
    });

    this.messageForm = this.fb.group({
      text: [""],
      files: [[]],
    });
  }

  taskDetailForm: FormGroup;

  messageForm: FormGroup;
  /** Сообщение, на которое отвечаем */
  replyMessage?: ChatMessage;
  messages = signal<any[]>([
    // {
    //   id: 1,
    //   text: "123",
    //   author: {
    //     id: 11,
    //     avatar: "https://api.selcdn.ru/v1/SEL_228194/procollab_media/5388035211510428528/2458680223122098610_2202079899633949339.webp",
    //     firstName: "Егоg",
    //     lastName: "Токареg",
    //   },
    //   createdAt: new Date().toISOString(),
    //   isRead: false,
    //   replyTo: this.replyMessage?.id ?? null,
    //   files: [],
    // }
  ]);

  isChangeDescriptionText = signal<boolean>(false);

  remainingDaysDeadline = signal<number>(0);

  editingTag: TagDto | null = null;

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  /** Объект с сообщениями об ошибках */
  errorMessage = ErrorMessage;

  descriptionExpandable!: boolean; // Флаг необходимости кнопки "подробнее"
  readFullDescription = false; // Флаг показа описания

  isActionTypeOpen = false;
  isPriorityTypeOpen = false;
  isDeleteTypeOpen = false;
  isResponsiblePickOpen = false;
  isPerformersPickOpen = false;
  isGoalPickOpen = false;
  isTagsPickOpen = false;

  isCommentedClick = false;
  isCompletedTask = false;

  creatingTag = false;
  loadingFile = false;
  sendFormIsSubmitting = false;

  showEditAvatarIcon = false;
  showEditDeadlineDatePicker = false;
  showEditStartDatePicker = false;
  showChangeGoalModal = false;

  showAttachResultModal = false;
  showResultModal = false;
  showAcceptResultModal = false;
  showUnAcceptResultModal = false;
  showDeleteResultModal = false;
  showLeaderCommentedResultModal = false;

  skillsGroupsModalOpen = signal(false);
  nestedSkills$ = this.skillsService.getSkillsNested();
  openGroupIds = new Set<number>();
  openGroupIndex: number | null = null;

  /** Массив прикрепленных файлов с метаданными */
  attachFiles: {
    name: string;
    size: string;
    type: string;
    link?: string;
    loading: boolean;
  }[] = [];

  /** Форма отправки результата */
  sendResultForm: FormGroup;

  getPriorityType = getPriorityType;
  getActionType = getActionType;

  subscriptions: Subscription[] = [];

  readonly taskDetailInfo = this.kanbanBoardDetailInfoService.taskDetail;
  readonly leaderId = this.kanbanBoardDetailInfoService.leaderId;
  readonly collaborators = this.projectDataService.collaborators;
  readonly goals = this.projectDataService.goals;
  readonly isLeaderLeaveComment = this.kanbanBoardDetailInfoService.isLeaderLeaveComment;
  readonly isLeader = this.kanbanBoardDetailInfoService.isLeader;
  readonly isPerformer = this.kanbanBoardDetailInfoService.isPerformer;
  readonly isResponsible = this.kanbanBoardDetailInfoService.isResponsible;
  readonly isCreator = this.kanbanBoardDetailInfoService.isCreator;
  readonly isExternal = this.kanbanBoardDetailInfoService.isExternal;
  readonly isTaskResult = this.kanbanBoardDetailInfoService.isTaskResult;
  readonly isLeaderAcceptResult = this.kanbanBoardDetailInfoService.isLeaderAcceptResult;

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
    return this.collaborators()?.length
      ? this.collaborators()!.map(collaborator => ({
          id: collaborator.userId,
          label: collaborator.firstName + " " + collaborator.lastName[0],
          value: collaborator.userId,
          additionalInfo: collaborator.avatar,
        }))
      : [];
  }

  get goalPickOptions() {
    return this.goals()?.length
      ? this.goals()!.map(goal => ({
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

  get isCommented() {
    return this.messages().length > 0 && this.isLeaderLeaveComment();
  }

  get isCommentedByLeader() {
    return (
      this.messages().some((comments: ChatMessage) => comments.author.id === this.leaderId()) &&
      this.isLeaderLeaveComment()
    );
  }

  ngOnInit(): void {
    console.log(
      "IS CREATOR" + " " + this.isCreator(),
      "IS LEADER" + " " + this.isLeader(),
      "IS PERFORMER" + " " + this.isPerformer(),
      "IS RESPONSIBLE" + " " + this.isResponsible(),
      "IS EXTERNAL" + " " + this.isExternal()
    );

    this.updateDescriptionState();
  }

  /**
   * Проверка возможности расширения описания после инициализации представления
   */
  ngAfterViewInit(): void {
    const todayDate = new Date();

    this.initializeTaskDetailInfo(todayDate);
    this.checkDescriptionHeigth();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  onDeleteTaskGoal(): void {
    this.taskDetailForm.patchValue({ goal: null });
    this.isGoalPickOpen = false;
  }

  onDeleteTaskTag(tagId: number): void {
    const tags = this.taskDetailForm.get("tags")?.value || [];

    const remainingTags = tags.filter((tag: TagDto) => tag.id !== tagId);
    this.taskDetailForm.patchValue({ tags: remainingTags });

    this.isTagsPickOpen = false;
  }

  onEditTaskTag(tagId: number): void {
    this.isTagsPickOpen = !this.isTagsPickOpen;
    this.creatingTag = true;

    const tags: TagDto[] = this.taskDetailForm.get("tags")?.value || [];
    const tag = tags.find((tag: TagDto) => tag.id === tagId);

    if (tag) {
      this.editingTag = {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      };
    }
  }

  onUpdateTag({ id, name, color }: TagDto): void {
    const tagsLib = [...(this.taskDetailForm.get("tagsLib")?.value || [])];
    const libIndex = tagsLib.findIndex((tag: TagDto) => tag.id === id);

    if (libIndex !== -1) {
      tagsLib[libIndex] = {
        ...tagsLib[libIndex],
        label: name,
        value: name,
        additionalInfo: color,
      };

      this.taskDetailForm.patchValue({ tagsLib: [...tagsLib] });
    }

    const tags: TagDto[] = [...(this.taskDetailForm.get("tags")?.value || [])];
    const tagIndex = tags.findIndex((tag: TagDto) => tag.id === id);

    if (tagIndex !== -1) {
      tags[tagIndex] = {
        ...tags[tagIndex],
        name,
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
    tagsLib.setValue([...tagsLib, tagInfo]);
  }

  onTypeSelect(
    type: "type" | "priority" | "responsible" | "performers" | "goal" | "tags" | "delete",
    state: boolean,
    typeId?: number
  ) {
    switch (type) {
      case "type":
        if (this.isLeader() || this.isCreator()) {
          this.isActionTypeOpen = state;
          this.taskDetailForm.patchValue({ action: typeId });
        }

        break;

      case "priority":
        if (this.isLeader() || this.isCreator()) {
          this.isPriorityTypeOpen = state;
          this.taskDetailForm.patchValue({ priority: typeId });
        }

        break;

      case "responsible": {
        if (this.isLeader() || this.isCreator()) {
          this.isResponsiblePickOpen = state;

          if (typeId !== undefined) {
            if (!this.collaborators()) return;

            const responsible = this.collaborators()?.find(
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
        }
        break;
      }

      case "performers": {
        if (this.isResponsible() || this.isLeader() || this.isCreator()) {
          this.isPerformersPickOpen = state;

          if (typeId !== undefined) {
            if (!this.collaborators()) return;

            const collaborator = this.collaborators()?.find(
              collaborator => collaborator.userId === typeId
            );
            const currentPerformers: PerformerDto[] =
              this.taskDetailForm.get("performers")?.value || [];
            const payload = {
              id: collaborator?.userId,
              avatar: collaborator?.avatar,
              name: collaborator?.firstName + " " + collaborator?.lastName[0],
            };

            if (currentPerformers.some((performer: PerformerDto) => performer.id === payload.id))
              return;

            this.taskDetailForm.patchValue({
              performers: [...currentPerformers, payload],
            });
          }
        }
        break;
      }

      case "goal": {
        if (this.isLeader() || this.isCreator()) {
          this.isGoalPickOpen = state;

          if (typeId !== undefined) {
            if (!this.goals()) return;

            const goal = this.goals()?.find(goal => goal.id === typeId);
            if (goal) this.taskDetailForm.patchValue({ goal: { id: goal.id, title: goal.title } });
          }
        }

        break;
      }

      case "tags": {
        if (this.isLeader() || this.isCreator()) {
          this.isTagsPickOpen = state;

          if (!state) {
            this.editingTag = null;
            this.creatingTag = false;
          }

          if (typeId !== undefined) {
            const tag = this.tagsPickOptions.find((tag: TagDto) => tag.id === typeId);
            const payload = { id: tag?.id, title: tag?.label, color: tag?.additionalInfo };

            const currentTags = this.taskDetailForm.get("tags")?.value || [];
            if (currentTags.some((tag: TagDto) => tag.id === payload.id)) return;
            this.taskDetailForm.patchValue({ tags: [...currentTags, payload] });
          } else {
            this.editingTag = null;
            this.creatingTag = false;
          }
        }

        break;
      }

      case "delete": {
        this.isDeleteTypeOpen = state;

        if (typeId !== undefined) {
          const taskId = +this.route.snapshot.queryParams["taskId"];

          if (this.isCreator() || this.isLeader()) {
            this.kanbanBoardDetailInfoService.requestDeleteTask(taskId);
          }
        }

        break;
      }

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
   * Обработчик загрузки файлов через input
   * @param evt - событие выбора файлов
   */
  onUpload(evt: Event) {
    const files = (evt.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    this.addFiles(files);
  }

  /**
   * Добавление файлов для загрузки
   * Создает записи в массиве attachFiles и запускает загрузку на сервер
   * @param files - список файлов для загрузки
   */
  private addFiles(files: FileList): void {
    // Создание записей для каждого файла
    for (let i = 0; i < files.length; i++) {
      this.attachFiles.push({
        name: files[i].name,
        size: files[i].size.toString(),
        type: files[i].type,
        loading: true,
      });
    }

    // Загрузка каждого файла на сервер
    for (let i = 0; i < files.length; i++) {
      this.fileService
        .uploadFile(files[i])
        .pipe(map(r => r.url))
        .subscribe({
          next: url => {
            setTimeout(() => {
              this.attachFiles[i].loading = false;
              this.attachFiles[i].link = url;
            });
          },
          complete: () => {
            setTimeout(() => {
              this.attachFiles[i].loading = false;
            });
          },
        });
    }
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
   * Обработчик отправки формы
   * Валидирует форму и отправляет результат на сервер
   */
  onSubmit(): void {
    // Проверка валидности формы
    if (!this.validationService.getFormValidation(this.sendResultForm)) {
      return;
    }

    // Установка флага загрузки
    this.sendFormIsSubmitting = true;

    // TODO: Отправка отклика на сервер
    // this.snackbarService.success("результат работы успешно прикреплен");

    this.showAttachResultModal = false;
    this.showResultModal = false;
  }

  /**
   * Отправка сообщения
   */
  onSubmitMessage(): void {
    const text = this.messageForm.get("text")?.value?.trim();

    if (!text) return;

    const newMessage = {
      id: Date.now(),
      text,
      author: this.kanbanBoardDetailInfoService.currentUser(),
      createdAt: new Date().toISOString(),
      isRead: false,
      replyTo: this.replyMessage?.id ?? null,
      files: this.messageForm.get("files")?.value || [],
    };

    this.messages.update(messages => [...messages, newMessage]);

    this.messageForm.reset({
      text: "",
      files: [],
    });

    this.replyMessage = undefined;
    this.scrollToBottom();
  }

  onEnterKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.key === "Enter" && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.onSubmitMessage();
    }
  }

  /**
   * Установка сообщения для ответа (заготовка)
   */
  onReplyMessage(messageId: number): void {
    this.replyMessage = this.messages().find(message => message.id === messageId);
  }

  /**
   * Отмена ответа
   */
  onCancelReply(): void {
    this.replyMessage = undefined;
  }

  private updateDescriptionState() {
    const descriptionControl = this.taskDetailForm.get("description");

    if (!(this.isLeader() || this.isCreator())) {
      descriptionControl?.disable();
    } else {
      descriptionControl?.enable();
    }
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
   * Прокрутка к низу списка сообщений
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      this.viewport?.scrollTo({ bottom: 0 });

      setTimeout(() => {
        this.viewport?.scrollTo({ bottom: 0 });
      }, 50);
    });
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

  private initializeTaskDetailInfo(todayDate: Date): void {
    const startDateDefault = new Date(todayDate);
    startDateDefault.setDate(todayDate.getDate() + 1);

    const deadlineDefault = new Date(todayDate);
    deadlineDefault.setDate(todayDate.getDate() + 2);

    const taskId = this.route.snapshot.queryParams["taskId"];

    const taskDetailInfo$ = this.kanbanBoardService.getTaskById(taskId).subscribe({
      next: (taskDetailInfo: TaskDetail) => {
        this.kanbanBoardDetailInfoService.setTaskDetailInfo(taskDetailInfo);

        this.taskDetailForm.patchValue({
          title: taskDetailInfo.title ?? "",
          type: taskDetailInfo.type ?? 1,
          priority: taskDetailInfo.priority ?? 1,
          responsible: taskDetailInfo.responsible ?? null,
          performers: taskDetailInfo.performers ?? [],
          startDate: taskDetailInfo.datetimeTaskStart ?? startDateDefault,
          deadline: taskDetailInfo.deadlineDate
            ? new Date(taskDetailInfo.deadlineDate)
            : deadlineDefault,
          tags: taskDetailInfo.tags ?? [],
          goal: taskDetailInfo.goal ?? null,
          skills: taskDetailInfo.requiredSkills ?? [],
          description: taskDetailInfo.description ?? null,
          files: taskDetailInfo.files ?? [],
          score: taskDetailInfo.score ?? 1,
          creator: taskDetailInfo.creator ?? this.kanbanBoardDetailInfoService.currentUser(),
          createdAt: taskDetailInfo.datetimeCreated ?? new Date(),
        });

        if (taskDetailInfo.result) {
          this.sendResultForm.patchValue({
            description: taskDetailInfo.result.description,
            accompanyingFile: taskDetailInfo.result.accompanyingFile,
          });
        }

        this.remainingDaysDeadline.set(
          daysUntil(
            taskDetailInfo.deadlineDate ? new Date(taskDetailInfo.deadlineDate) : deadlineDefault
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
