/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IndustryService } from "../../services/industry.service";
import { map, pluck, Subscription } from "rxjs";
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
    private inviteService: InviteService
  ) {
    this.projectForm = this.fb.group({
      imageAddress: ["", [Validators.required]],
      name: ["", [Validators.required]],
      industryId: [undefined, [Validators.required]],
      description: ["", [Validators.required]],
      presentationAddress: ["", [Validators.required]],
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
          Validators.pattern(/^http(s)?:\/\/\w+(:[0-9]*)?\/office\/profile\/\d+$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Создание проекта");
  }

  ngAfterViewInit(): void {
    this.profile$ = this.route.data
      .pipe(pluck("data"))
      .subscribe(([project, vacancies, invites]: [Project, Vacancy[], Invite[]]) => {
        this.projectForm.patchValue({
          imageAddress: project.imageAddress,
          name: project.name,
          industryId: project.industryId,
          description: project.description,
          presentationAddress: project.presentationAddress,
        });

        project.achievements?.length &&
          project.achievements.forEach(achievement =>
            this.addAchievement(achievement.title, achievement.place)
          );

        this.vacancies = vacancies;

        this.invites = invites;
      });
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
  }

  profile$?: Subscription;

  errorMessage = ErrorMessage;

  industries$ = this.industryService.industries.pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    )
  );

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
      return;
    }

    this.vacancyIsSubmitting = true;

    this.vacancyService
      .postVacancy(Number(this.route.snapshot.paramMap.get("projectId")), this.vacancyForm.value)
      .subscribe(
        vacancy => {
          this.vacancies.push(vacancy);

          this.requirements.clear();
          this.vacancyForm.reset();

          this.vacancyIsSubmitting = false;
        },
        () => {
          this.vacancyIsSubmitting = false;
        }
      );
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
      .subscribe(
        profile => {
          this.inviteFormIsSubmitting = false;

          this.invites.push(profile);
        },
        () => {
          this.inviteFormIsSubmitting = false;
        }
      );
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

  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.projectForm)) {
      return;
    }

    this.projectFormIsSubmitting = true;

    this.projectService
      .updateProject(Number(this.route.snapshot.paramMap.get("projectId")), this.projectForm.value)
      .subscribe(
        () => {
          this.projectFormIsSubmitting = false;
        },
        () => {
          this.projectFormIsSubmitting = false;
        }
      );
  }
}
