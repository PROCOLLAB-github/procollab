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
    private navService: NavService,
    private validationService: ValidationService,
    private vacancyService: VacancyService
  ) {
    this.projectForm = this.fb.group({
      name: ["", [Validators.required]],
      industry: [undefined, [Validators.required]],
      description: ["", [Validators.required]],
      achievements: this.fb.array([]),
    });

    this.vacancyForm = this.fb.group({
      role: ["", [Validators.required]],
      requirements: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Создание проекта");
  }

  ngAfterViewInit(): void {
    this.profile$ = this.route.data
      .pipe(pluck("data"))
      .subscribe(([project, vacancies]: [Project, Vacancy[]]) => {
        this.projectForm.patchValue({
          name: project.name,
          industry: project.industryId,
          description: project.description,
          achievements: project.achievements,
        });

        project.achievements.forEach(achievement =>
          this.addAchievement(achievement.title, achievement.place)
        );

        this.vacancies = vacancies;
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

  submitVacancy() {
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

  projectForm: FormGroup;

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
}
