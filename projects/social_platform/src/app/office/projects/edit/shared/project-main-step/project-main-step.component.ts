/** @format */

import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from "@angular/core";
import { FormArray, FormGroup, ReactiveFormsModule } from "@angular/forms";
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
import { generateTrlList } from "@utils/generate-trl-list";

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
  ],
})
export class ProjectMainStepComponent implements OnInit, OnDestroy {
  @Input() industries$!: Observable<any[]>;
  @Input() projectSteps$!: Observable<any[]>;
  @Input() programTagsOptions: any[] = [];
  @Input() leaderId = 0;
  @Input() projSubmitInitiated = false;
  @Input() projectId!: number;
  @Input() isProjectBoundToProgram = false;

  @Output() assignToProgram = new EventEmitter<void>();

  private subscription = new Subscription();

  readonly authService = inject(AuthService);
  private readonly projectFormService = inject(ProjectFormService);

  readonly errorMessage = ErrorMessage;
  readonly trackList = trackProjectList;
  readonly directionList = directionProjectList;
  readonly trlList = generateTrlList(9);

  // Получаем форму из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onAssignToProgram(): void {
    this.assignToProgram.emit();
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
}
