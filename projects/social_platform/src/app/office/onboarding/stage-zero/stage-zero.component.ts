/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { User, workExperience } from "@auth/models/user.model";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";

@Component({
  selector: "app-stage-zero",
  templateUrl: "./stage-zero.component.html",
  styleUrl: "./stage-zero.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AvatarControlComponent,
    InputComponent,
    ButtonComponent,
    ControlErrorPipe,
    SelectComponent,
  ],
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  constructor(
    public readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly router: Router
  ) {
    this.stageForm = this.fb.group({
      avatar: ["", [Validators.required]],
      city: ["", [Validators.required]],
      education: this.fb.array([]),
      workExperience: this.fb.array([]),

      // education
      organizationName: [""],
      entryYear: [null],
      completionYear: [null],
      description: [null],
      educationStatus: [null],
      educationLevel: [null],

      // work
      organizationNameWork: [""],
      entryYearWork: [null],
      completionYearWork: [null],
      descriptionWork: [null],
      jobPosition: [null],
    });
  }

  ngOnInit(): void {
    const profile$ = this.authService.profile.subscribe(p => {
      this.profile = p;
    });

    const formValueState$ = this.onboardingService.formValue$.subscribe(fv => {
      this.stageForm.patchValue({
        avatar: fv.avatar,
        city: fv.city,
        education: fv.education,
        workExperience: fv.workExperience,
      });
    });

    this.subscriptions$.push(profile$, formValueState$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  yearListEducation = [
    {
      value: 2000,
      id: 0,
      label: "2000",
    },
    {
      value: 2001,
      id: 1,
      label: "2001",
    },
    {
      value: 2002,
      id: 2,
      label: "2002",
    },
    {
      value: 2003,
      id: 3,
      label: "2003",
    },
    {
      value: 2004,
      id: 4,
      label: "2004",
    },
    {
      value: 2005,
      id: 5,
      label: "2005",
    },
    {
      value: 2006,
      id: 6,
      label: "2006",
    },
    {
      value: 2007,
      id: 7,
      label: "2007",
    },
    {
      value: 2008,
      id: 8,
      label: "2008",
    },
    {
      value: 2009,
      id: 9,
      label: "2009",
    },
    {
      value: 2010,
      id: 10,
      label: "2010",
    },
    {
      value: 2011,
      id: 11,
      label: "2011",
    },
    {
      value: 2012,
      id: 12,
      label: "2012",
    },
    {
      value: 2013,
      id: 13,
      label: "2013",
    },
    {
      value: 2014,
      id: 14,
      label: "2014",
    },
    {
      value: 2015,
      id: 15,
      label: "2015",
    },
    {
      value: 2016,
      id: 16,
      label: "2016",
    },
    {
      value: 2017,
      id: 17,
      label: "2017",
    },
    {
      value: 2018,
      id: 18,
      label: "2018",
    },
    {
      value: 2019,
      id: 19,
      label: "2019",
    },
    {
      value: 2020,
      id: 20,
      label: "2020",
    },
    {
      value: 2021,
      id: 21,
      label: "2021",
    },
    {
      value: 2022,
      id: 22,
      label: "2022",
    },
    {
      value: 2023,
      id: 23,
      label: "2023",
    },
    {
      value: 2024,
      id: 24,
      label: "2024",
    },
    {
      value: 2025,
      id: 25,
      label: "н.в",
    },
  ];

  educationStatusList = [
    {
      id: 0,
      value: "Ученик",
      label: "Ученик",
    },
    {
      id: 1,
      value: "Студент",
      label: "Студент",
    },
    {
      id: 2,
      value: "Выпускник",
      label: "Выпускник",
    },
  ];

  educationLevelList = [
    {
      id: 0,
      value: "Среднее общее образование",
      label: "Среднее общее образование",
    },
    {
      id: 1,
      value: "Среднее профессиональное образование",
      label: "Среднее профессиональное образование",
    },
    {
      id: 2,
      value: "Высшее образование – бакалавриат, специалитет",
      label: "Высшее образование – бакалавриат, специалитет",
    },
    {
      id: 3,
      value: "Высшее образование – магистратура",
      label: "Высшее образование – магистратура",
    },
    {
      id: 4,
      value: "Высшее образование – аспирантура",
      label: "Высшее образование – аспирантура",
    },
  ];

  stageForm: FormGroup;
  errorMessage = ErrorMessage;
  profile?: User;
  stageSubmitting = false;
  subscriptions$: Subscription[] = [];

  get education(): FormArray {
    return this.stageForm.get("education") as FormArray;
  }

  get workExperience(): FormArray {
    return this.stageForm.get("workExperience") as FormArray;
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.stageForm.get("organizationName")?.value,
      entryYear: this.stageForm.get("entryYear")?.value,
      completionYear: this.stageForm.get("completionYear")?.value,
      description: this.stageForm.get("description")?.value,
      educationStatus: this.stageForm.get("educationStatus")?.value,
      educationLevel: this.stageForm.get("educationLevel")?.value,
    });

    const workItem = this.fb.group({
      organizationName: this.stageForm.get("organizationNameWork")?.value,
      entryYear: this.stageForm.get("entryYearWork")?.value,
      completionYear: this.stageForm.get("completionYearWork")?.value,
      description: this.stageForm.get("descriptionWork")?.value,
      jobPosition: this.stageForm.get("jobPosition")?.value,
    });

    const educationItemFilled = Object.values(educationItem.value).some(
      value => value !== null && value !== ""
    );
    const workItemFilled = Object.values(workItem.value).some(
      value => value !== null && value !== ""
    );

    this.stageSubmitting = false;

    if (educationItemFilled) {
      if (!educationItem.get("organizationName")?.value) {
        this.stageForm.get("organizationName")?.setValidators([Validators.required]);
        this.stageForm.get("organizationName")?.markAsTouched();
        this.stageSubmitting = true;
        setTimeout(() => {
          this.stageSubmitting = false;
        }, 500);
      } else {
        this.education.push(educationItem);
        this.stageForm.get("organizationName")?.clearValidators();
        this.stageForm.get("organizationName")?.markAsPristine();
      }
      this.stageForm.get("organizationName")?.updateValueAndValidity();
    }

    if (workItemFilled) {
      if (!workItem.get("organizationName")?.value) {
        this.stageForm.get("organizationNameWork")?.setValidators([Validators.required]);
        this.stageForm.get("organizationNameWork")?.markAsTouched();
        this.stageSubmitting = true;
        setTimeout(() => {
          this.stageSubmitting = false;
        }, 500);
      } else {
        this.workExperience.push(workItem);
        this.stageForm.get("organizationNameWork")?.clearValidators();
        this.stageForm.get("organizationNameWork")?.markAsPristine();
      }
      this.stageForm.get("organizationNameWork")?.updateValueAndValidity();
    }

    if (this.stageSubmitting) {
      return;
    }

    this.stageSubmitting = true;

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(1)))
      .subscribe(() => {
        this.onboardingService.setFormValue(this.stageForm.value);
        this.router
          .navigateByUrl("/office/onboarding/stage-1")
          .then(() => console.debug("Route changed from OnboardingStageZeroComponent"));
      });
  }
}
