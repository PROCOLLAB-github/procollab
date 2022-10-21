/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IndustryService } from "../../services/industry.service";
import { distinctUntilChanged, map, Subscription } from "rxjs";
import { ErrorMessage } from "../../../error/models/error-message";
import { NavService } from "../../services/nav.service";
import { Project } from "../../models/project.model";
import { Vacancy } from "../../models/vacancy.model";
import { ValidationService } from "../../../core/services";
import { VacancyService } from "../../services/vacancy.service";
import { InviteService } from "../../services/invite.service";
import { Invite } from "../../models/invite.model";
import { ProjectService } from "../../services/project.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class ProjectEditComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private industryService: IndustryService,
    protected projectService: ProjectService,
    private navService: NavService,
    private validationService: ValidationService,
    private vacancyService: VacancyService,
    private inviteService: InviteService,
    private cdRef: ChangeDetectorRef
  ) {
    this.projectForm = this.fb.group({
      imageAddress: ["", [Validators.required]],
      name: ["", [Validators.required]],
      industryId: [undefined, [Validators.required]],
      description: ["", [Validators.required]],
      presentationAddress: [""],
      achievements: this.fb.array([]),
    });

    this.vacancyForm = this.fb.group({
      role: ["", [Validators.required]],
      requirements: this.fb.array([]),
    });

    this.inviteForm = this.fb.group({
      role: ["", [Validators.required]],
      // eslint-disable-next-line
      link: [
        "",
        [
          Validators.required,
          Validators.pattern(/^http(s)?:\/\/.+(:[0-9]*)?\/office\/profile\/\d+$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Создание проекта");
    const controls: (AbstractControl | null)[] = [
      this.inviteForm.get("role"),
      this.inviteForm.get("link"),
      this.vacancyForm.get("role"),
      this.vacancyForm.get("requirements"),
    ];

    controls.filter(Boolean).forEach(control => {
      this.subscriptions.push(
        control?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
          if (value === "") {
            control?.removeValidators([Validators.required]);
            control?.updateValueAndValidity();
          }
        })
      );
    });
  }

  ngAfterViewInit(): void {
    this.profile$ = this.route.data
      .pipe(map(d => d["data"]))
      .subscribe(([project, vacancies, invites]: [Project, Vacancy[], Invite[]]) => {
        this.projectForm.patchValue({
          imageAddress: project.imageAddress,
          name: project.name,
          industryId: project.industryId,
          description: project.description,
          presentationAddress: project.presentationAddress,
        });

        project.achievements &&
          project.achievements.forEach(achievement =>
            this.addAchievement(achievement.title, achievement.place)
          );

        this.vacancies = vacancies;

        this.invites = invites;

        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
    this.subscriptions.forEach($ => $?.unsubscribe());
  }

  profile$?: Subscription;

  errorMessage = ErrorMessage;

  industries$ = this.industryService.industries.pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    )
  );

  subscriptions: (Subscription | undefined)[] = [];

  vacancies: Vacancy[] = [];
  vacancyForm: FormGroup;

  requirementTitle = "";

  addRequirement(): void {
    if (!this.requirementTitle) {
      return;
    }

    this.requirements.push(this.fb.control(this.requirementTitle ?? ""));
    this.requirementTitle = "";
  }

  removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  get requirements(): FormArray {
    return this.vacancyForm.get("requirements") as FormArray;
  }

  vacancyIsSubmitting = false;

  submitVacancy(): void {
    if (!this.validationService.getFormValidation(this.vacancyForm)) {
      const controls = [this.vacancyForm.get("role"), this.vacancyForm.get("requirements")];

      controls.filter(Boolean).forEach(control => {
        console.debug("Submit vacancy error: ", control);

        control?.addValidators([Validators.required]);
        control?.updateValueAndValidity({ emitEvent: false });
      });

      return;
    }

    this.vacancyIsSubmitting = true;

    this.vacancyService
      .postVacancy(Number(this.route.snapshot.paramMap.get("projectId")), this.vacancyForm.value)
      .subscribe({
        next: vacancy => {
          this.vacancies.push(vacancy);

          this.requirements.clear();
          this.vacancyForm.reset();

          this.vacancyIsSubmitting = false;
        },
        error: () => {
          this.vacancyIsSubmitting = false;
        },
      });
  }

  removeVacancy(vacancyId: number): void {
    if (!confirm("Вы точно хотите удалить вакансию?")) {
      return;
    }

    this.vacancyService.deleteVacancy(vacancyId).subscribe(() => {
      const index = this.vacancies.findIndex(vacancy => vacancy.id === vacancyId);
      this.vacancies.splice(index, 1);
    });
  }

  inviteForm: FormGroup;
  inviteFormIsSubmitting = false;

  invites: Invite[] = [];

  submitInvite(): void {
    if (!this.validationService.getFormValidation(this.inviteForm)) {
      const controls = [this.inviteForm.get("role"), this.inviteForm.get("link")];

      controls.filter(Boolean).forEach(control => {
        console.debug("Submit invite error: ", control);

        control?.addValidators([Validators.required]);
        control?.updateValueAndValidity({ emitEvent: false });
      });

      return;
    }

    this.inviteFormIsSubmitting = true;

    const link = new URL(this.inviteForm.get("link")?.value);

    // Sure that it's works because of regex validation
    const path = link.pathname.split("/");
    this.inviteService
      .sendForUser(
        Number(path[path.length - 1]),
        Number(this.route.snapshot.paramMap.get("projectId"))
      )
      .subscribe({
        next: profile => {
          this.inviteFormIsSubmitting = false;
          this.inviteForm.reset();

          this.invites.push(profile);
        },
        error: () => {
          this.inviteFormIsSubmitting = false;
        },
      });
  }

  removeInvitation(invitationId: number): void {
    this.inviteService.revokeInvite(invitationId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === invitationId);
      this.invites.splice(index, 1);
    });
  }

  projectForm: FormGroup;
  projectFormIsSubmitting = false;

  get achievements(): FormArray {
    return this.projectForm.get("achievements") as FormArray;
  }

  addAchievement(title?: string, place?: string): void {
    const formGroup = this.fb.group({
      title: [title ?? "", [Validators.required]],
      place: [place ?? "", [Validators.required]],
    });

    this.achievements.push(formGroup);
  }

  removeAchievement(index: number): void {
    this.achievements.removeAt(index);
  }

  saveProject(): void {
    if (!this.validationService.getFormValidation(this.projectForm)) {
      return;
    }

    this.projectFormIsSubmitting = true;

    this.projectService
      .updateProject(Number(this.route.snapshot.paramMap.get("projectId")), this.projectForm.value)
      .subscribe({
        next: () => {
          this.projectFormIsSubmitting = false;
        },
        error: () => {
          this.projectFormIsSubmitting = false;
        },
      });
  }
}
