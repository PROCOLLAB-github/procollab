/** @format */

import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { concatMap, map, Observable, Subscription, take } from "rxjs";
import { AuthService } from "@auth/services";
import { ValidationService, ControlErrorPipe } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { Skill } from "@office/models/skill";
import { SkillsService } from "@office/services/skills.service";
import { SkillsGroup } from "@office/models/skills-group";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";

@Component({
  selector: "app-stage-two",
  templateUrl: "./stage-two.component.html",
  styleUrl: "./stage-two.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsGroupComponent,
    SkillsBasketComponent,
  ],
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  constructor(
    private readonly nnFb: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly validationService: ValidationService,
    private readonly skillsService: SkillsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  stageForm = this.nnFb.group({
    skills: this.nnFb.control<Skill[]>([], Validators.required),
  });

  nestedSkills$: Observable<SkillsGroup[]> = this.route.data.pipe(map(r => r["data"]));

  searchedSkills = signal<Skill[]>([]);

  stageSubmitting = signal(false);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const fv$ = this.onboardingService.formValue$
      .pipe(take(1))
      .subscribe(({ skills }) => this.stageForm.patchValue({ skills }));

    const formValueChange$ = this.stageForm.valueChanges.subscribe(value => {
      this.onboardingService.setFormValue(value);
    });

    this.subscriptions$().push(fv$, formValueChange$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting.set(true);

    const { skills } = this.stageForm.getRawValue();

    this.authService
      .saveProfile({ skillsIds: skills.map(skill => skill.id) })
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office/onboarding/stage-3")
          .then(() => console.debug("Route changed from OnboardingStageOneComponent"));
      });
  }

  onAddSkill(newSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    const isPresent = skills.some(s => s.id === newSkill.id);

    if (isPresent) return;

    this.stageForm.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    this.stageForm.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onOptionToggled(toggledSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onSearchSkill(query: string): void {
    this.skillsService
      .getSkillsInline(query, 1000, 0)
      .subscribe(({ results }) => this.searchedSkills.set(results));
  }
}
