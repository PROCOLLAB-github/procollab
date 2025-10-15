/** @format */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@auth/services";
import { ErrorMessage } from "@error/models/error-message";
import { directionProjectList } from "projects/core/src/consts/list-direction-project";
import { trackProjectList } from "projects/core/src/consts/list-track-project";
import { Observable, Subscription } from "rxjs";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { InputComponent, SelectComponent, ButtonComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ControlErrorPipe } from "@corelib";
import { ProjectFormService } from "../../services/project-form.service";
import { IconComponent } from "@uilib";
import { ProjectContactsService } from "../../services/project-contacts.service";
import { ProjectGoalService } from "../../services/project-goals.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProjectTeamService } from "../../services/project-team.service";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ProjectService } from "@office/services/project.service";
import { RouterLink } from "@angular/router";
import { generateOptionsList } from "@utils/generate-options-list";

@Component({
  selector: "app-project-main-step",
  templateUrl: "./project-main-step.component.html",
  styleUrl: "./project-main-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarControlComponent,
    InputComponent,
    SelectComponent,
    IconComponent,
    TextareaComponent,
    ButtonComponent,
    UploadFileComponent,
    AsyncPipe,
    ControlErrorPipe,
    ModalComponent,
    AvatarComponent,
    FormsModule,
    RouterLink,
  ],
})
export class ProjectMainStepComponent implements OnInit, OnDestroy {
  @Input() industries$!: Observable<any[]>;
  @Input() leaderId = 0;
  @Input() projSubmitInitiated = false;
  @Input() projectId!: number;
  @Input() isProjectBoundToProgram = false;

  private subscription = new Subscription();

  readonly authService = inject(AuthService);
  private readonly projectService = inject(ProjectService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly projectContactsService = inject(ProjectContactsService);
  private readonly projectGoalsService = inject(ProjectGoalService);
  private readonly projectTeamService = inject(ProjectTeamService);
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = ErrorMessage;
  readonly trackList = trackProjectList;
  readonly directionList = directionProjectList;
  readonly trlList = generateOptionsList(9, "numbers");

  goalLeaderShowModal = false;
  activeGoalIndex = signal<number | null>(null);
  selectedLeaderId = "";

  // Получаем форму из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  get goalForm(): FormGroup {
    return this.projectGoalsService.getForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Геттеры для удобного доступа к контролам формы
  get name() {
    return this.projectFormService.name;
  }

  get region() {
    return this.projectFormService.region;
  }

  get industry() {
    return this.projectFormService.industry;
  }

  get description() {
    return this.projectFormService.description;
  }

  get actuality() {
    return this.projectFormService.actuality;
  }

  get implementationDeadline() {
    return this.projectFormService.implementationDeadline;
  }

  get problem() {
    return this.projectFormService.problem;
  }

  get targetAudience() {
    return this.projectFormService.targetAudience;
  }

  get trl() {
    return this.projectFormService.trl;
  }

  get presentationAddress() {
    return this.projectFormService.presentationAddress;
  }

  get coverImageAddress() {
    return this.projectFormService.coverImageAddress;
  }

  get imageAddress() {
    return this.projectFormService.imageAddress;
  }

  get partnerProgramId() {
    return this.projectFormService.partnerProgramId;
  }

  // Геттеры для работы со ссылками
  get link() {
    return this.projectContactsService.link;
  }

  get links(): FormArray {
    return this.projectContactsService.links;
  }

  get linksItems() {
    return this.projectContactsService.linksItems;
  }

  // Геттеры для работы с целями
  get goals(): FormArray {
    return this.projectGoalsService.goals;
  }

  get goalItems() {
    return this.projectGoalsService.goalItems;
  }

  get goalName() {
    return this.projectGoalsService.goalName;
  }

  get goalDate() {
    return this.projectGoalsService.goalDate;
  }

  get goalLeader() {
    return this.projectGoalsService.goalLeader;
  }

  get editIndex() {
    return this.projectFormService.editIndex;
  }

  get collaborators() {
    return this.projectTeamService.getCollaborators();
  }

  /**
   * Проверяет, есть ли ссылки для отображения
   */
  get hasLinks(): boolean {
    return this.links.length > 0;
  }

  /**
   * Проверяет, есть ли цели для отображения
   */
  get hasGoals(): boolean {
    return this.goals.length > 0;
  }

  /**
   * Добавление ссылки
   */
  addLink(link?: string): void {
    this.links.push(this.fb.control(link ?? "", [Validators.required]));
    this.projectContactsService.addLink(this.links, this.projectForm);
  }

  /**
   * Редактирование ссылки
   * @param index - индекс ссылки
   */
  editLink(index: number): void {
    this.projectContactsService.editLink(index, this.links, this.projectForm);
  }

  /**
   * Удаление ссылки
   * @param index - индекс ссылки
   */
  removeLink(index: number): void {
    this.projectContactsService.removeLink(index, this.links);
  }

  /**
   * Добавление цели
   */
  addGoal(goalName?: string, goalDate?: string, goalLeader?: string): void {
    this.goals.push(
      this.fb.group({
        title: [goalName, [Validators.required]],
        completionDate: [goalDate, [Validators.required]],
        responsible: [goalLeader, [Validators.required]],
      })
    );

    this.projectGoalsService.addGoal(goalName, goalDate, goalLeader);
  }

  /**
   * Удаление цели
   * @param index - индекс цели
   */
  removeGoal(index: number, goalId: number): void {
    this.projectGoalsService.removeGoal(index);
    this.projectService.deleteGoals(this.projectId, goalId).subscribe();
  }

  /**
   * Получить выбранного лидера для конкретной цели
   */
  getSelectedLeaderForGoal(goalIndex: number) {
    const goalFormGroup = this.goals.at(goalIndex);
    const leaderId = goalFormGroup?.get("responsible")?.value;

    if (!leaderId) return null;

    return this.collaborators.find(collab => collab.userId.toString() === leaderId.toString());
  }

  /**
   * Обработчик изменения радио-кнопки для выбора лидера
   */
  onLeaderRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedLeaderId = target.value;
  }

  /**
   * Добавление лидера на определенную цель
   */
  addLeader(): void {
    const goalIndex = this.activeGoalIndex();

    if (goalIndex === null) {
      return;
    }

    if (!this.selectedLeaderId) {
      return;
    }

    // Устанавливаем выбранного лидера в форму
    const goalFormGroup = this.goals.at(goalIndex);
    goalFormGroup?.get("responsible")?.setValue(this.selectedLeaderId);

    this.toggleGoalLeaderModal();
    this.selectedLeaderId = "";
  }

  /**
   * Переключатель для модалки выбора лидера
   */
  toggleGoalLeaderModal(index?: number): void {
    this.goalLeaderShowModal = !this.goalLeaderShowModal;

    if (index !== undefined) {
      this.activeGoalIndex.set(index);
      const currentLeader = this.goals.at(index)?.get("responsible")?.value;
      this.selectedLeaderId = currentLeader || "";
    } else {
      this.activeGoalIndex.set(null);
      this.selectedLeaderId = "";
    }
  }
}
