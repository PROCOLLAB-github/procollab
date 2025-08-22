/** @format */

import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
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

  @Output() assignToProgram = new EventEmitter<void>();

  private subscription = new Subscription();

  readonly authService = inject(AuthService);
  private readonly projectFormService = inject(ProjectFormService);

  readonly errorMessage = ErrorMessage;
  readonly trackList = trackProjectList;
  readonly directionList = directionProjectList;

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

  get step() {
    return this.projectFormService.step;
  }

  get description() {
    return this.projectFormService.description;
  }

  get actuality() {
    return this.projectFormService.actuality;
  }

  get goal() {
    return this.projectFormService.goal;
  }

  get problem() {
    return this.projectFormService.problem;
  }

  get trackControl() {
    return this.projectFormService.track;
  }

  get direction() {
    return this.projectFormService.direction;
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
