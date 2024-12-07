/** @format */

import { AsyncPipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ErrorMessage } from "@error/models/error-message";
import { Invite } from "@models/invite.model";
import { Project } from "@models/project.model";
import { Vacancy } from "@models/vacancy.model";
import { Skill } from "@office/models/skill";
import { ProgramTag } from "@office/program/models/program.model";
import { ProgramService } from "@office/program/services/program.service";
import { SkillsService } from "@office/services/skills.service";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { IndustryService } from "@services/industry.service";
import { InviteService } from "@services/invite.service";
import { NavService } from "@services/nav.service";
import { ProjectService } from "@services/project.service";
import { VacancyService } from "@services/vacancy.service";
import {
  BarComponent,
  ButtonComponent,
  IconComponent,
  InputComponent,
  SelectComponent,
} from "@ui/components";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { Observable, Subscription, concatMap, distinctUntilChanged, filter, map, tap } from "rxjs";
import { InviteCardComponent } from "../../shared/invite-card/invite-card.component";
import { VacancyCardComponent } from "../../shared/vacancy-card/vacancy-card.component";
import { LinkCardComponent } from "@office/shared/link-card/link-card.component";
import { title } from "process";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    AvatarControlComponent,
    InputComponent,
    IconComponent,
    ButtonComponent,
    SelectComponent,
    TextareaComponent,
    UploadFileComponent,
    InviteCardComponent,
    VacancyCardComponent,
    LinkCardComponent,
    TagComponent,
    ModalComponent,
    AsyncPipe,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    SkillsGroupComponent,
    BarComponent,
    TextareaComponent,
  ],
})
export class ProjectEditComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly industryService: IndustryService,
    protected readonly projectService: ProjectService,
    private readonly navService: NavService,
    private readonly validationService: ValidationService,
    private readonly vacancyService: VacancyService,
    private readonly inviteService: InviteService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly programService: ProgramService,
    private readonly skillsService: SkillsService
  ) {
    this.projectForm = this.fb.group({
      imageAddress: ["", [Validators.required]],
      name: ["", [Validators.required]],
      region: ["", [Validators.required]],
      step: [null, [Validators.required]],
      links: this.fb.array([]),
      link: [""],
      industryId: [undefined, [Validators.required]],
      description: ["", [Validators.required]],
      presentationAddress: ["", [Validators.required]],
      coverImageAddress: ["", Validators.required],
      partnerProgramId: [null],
      achievements: this.fb.array([]),
      achievementsName: [""],
      achievementsPrize: [""],
      draft: [null],
    });

    this.vacancyForm = this.fb.group({
      role: ["", [Validators.required]],
      skills: [[], Validators.required],
      description: ["", Validators.required],
      requiredExperience: ["", Validators.required],
      workFormat: ["", Validators.required],
      salary: ["", [Validators.pattern("^(\\d{1,3}( \\d{3})*|\\d+)$")]],
      workSchedule: ["", Validators.required],
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
      this.vacancyForm.get("skills"),
      this.vacancyForm.get("description"),
      this.vacancyForm.get("requiredExperience"),
      this.vacancyForm.get("workFormat"),
      this.vacancyForm.get("salary"),
      this.vacancyForm.get("workSchedule"),
    ];

    controls.filter(Boolean).forEach(control => {
      this.subscriptions.push(
        control?.valueChanges
          .pipe(
            distinctUntilChanged(),
            tap(() => {
              if (control === this.inviteForm.get("link") && this.inviteNotExistingError) {
                this.inviteNotExistingError = null;
              }
            }),
            filter(value => value === "")
          )
          .subscribe(() => {
            if (control === this.inviteForm.get("link")) {
              control?.clearValidators();
            } else {
              control?.removeValidators([Validators.required]);
            }
            control?.updateValueAndValidity();
          })
      );
    });

    this.projectForm
      .get("presentationAddress")
      ?.valueChanges.pipe(
        filter(r => !r),
        concatMap(() =>
          this.projectService.updateProject(Number(this.route.snapshot.params["projectId"]), {
            presentationAddress: "",
            draft: true,
          })
        )
      )
      .subscribe(() => {});

    this.projectForm
      .get("coverImageAddress")
      ?.valueChanges.pipe(
        filter(r => !r),
        concatMap(() =>
          this.projectService.updateProject(Number(this.route.snapshot.params["projectId"]), {
            coverImageAddress: "",
            draft: true,
          })
        )
      )
      .subscribe(() => {});

    this.editingStep = this.route.snapshot.queryParams["editingStep"];
  }

  ngAfterViewInit(): void {
    this.programService
      .programTags()
      .pipe(
        tap(tags => {
          this.programTags = tags;
        }),
        map(tags => [
          { label: "Без тега", value: 0, id: 0 },
          ...tags.map(t => ({ label: t.name, value: t.id, id: t.id })),
        ]),
        tap(tags => {
          this.programTagsOptions = tags;
        }),
        concatMap(() => this.route.data),
        map(d => d["data"])
      )
      .subscribe(([project, invites]: [Project, Invite[]]) => {
        this.projectForm.patchValue({
          imageAddress: project.imageAddress,
          name: project.name,
          region: project.region,
          step: project.step,
          industryId: project.industry,
          description: project.description,
          presentationAddress: project.presentationAddress,
          coverImageAddress: project.coverImageAddress,
        });

        if (project.partnerProgramsTags?.length) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const tag = this.programTags.find(p => p.tag === project.partnerProgramsTags[0]);

          this.projectForm.patchValue({
            partnerProgramId: tag?.id,
          });
        } else {
          this.projectForm.patchValue({
            partnerProgramId: null,
          });
        }

        this.achievements.clear();
        project.achievements.forEach(achievement => {
          this.achievements.push(
            this.fb.group({
              id: achievement.id,
              title: achievement.title,
              status: achievement.status,
            })
          );
        });

        this.links.clear();
        project.links.forEach(link => {
          this.links.push(
            this.fb.group({
              link: link,
            })
          );
        });

        this.vacancies = project.vacancies;

        this.invites = invites;

        this.cdRef.detectChanges();
      });
  }

  programTagsOptions: SelectComponent["options"] = [];
  programTags: ProgramTag[] = [];

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
    this.subscriptions.forEach($ => $?.unsubscribe());
  }

  /**
   * Current step of toggle, that navigates through
   * parts of project info
   */
  editingStep: "main" | "contacts" | "team" | "achievements" | "vacancies" = "main";

  isCompleted = false;

  profile$?: Subscription;

  errorMessage = ErrorMessage;

  errorModalMessage = signal<{
    program_name: string;
    whenCanEdit: string;
    daysUntilResolution: string;
  } | null>(null);

  industries$ = this.industryService.industries.pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    )
  );

  projectSteps$: Observable<SelectComponent["options"]> = this.projectService.steps.pipe(
    map(steps => steps.map(step => ({ id: step.id, label: step.name, value: step.id })))
  );

  subscriptions: (Subscription | undefined)[] = [];

  navItems = [
    {
      step: "main",
      src: "/assets/images/projects/edit/main.svg",
      label: "Основные данные",
    },
    {
      step: "contacts",
      src: "/assets/images/projects/edit/contacts.svg",
      label: "Контакты",
    },
    {
      step: "achievements",
      src: "/assets/images/projects/edit/achievements.svg",
      label: "Достижения",
    },
    {
      step: "team",
      src: "/assets/images/projects/edit/members.svg",
      label: "Участники",
    },
    {
      step: "vacancies",
      src: "/assets/images/projects/edit/vacancies.svg",
      label: "Вакансии",
    },
  ];

  experienceList = [
    {
      id: 0,
      value: "без опыта",
      label: "Без опыта",
    },
    {
      id: 1,
      value: "до 1 года",
      label: "До 1 года",
    },
    {
      id: 2,
      value: "от 1 года до 3 лет",
      label: "От 1 года до 3 лет",
    },
    {
      id: 3,
      value: "от 3 лет и более",
      label: "От 3 лет и более",
    },
  ];

  formatList = [
    {
      id: 0,
      value: "удаленная работа",
      label: "Удаленная работа",
    },
    {
      id: 1,
      value: "работа в офисе",
      label: "Работа в офисе",
    },
    {
      id: 2,
      value: "смешанная",
      label: "Смешанная",
    },
  ];

  scheludeList = [
    {
      id: 0,
      value: "полный рабочий день",
      label: "Полный рабочий день",
    },
    {
      id: 1,
      value: "сменный график",
      label: "Сменный график",
    },
    {
      id: 2,
      value: "гибкий график",
      label: "Гибкий график",
    },
    {
      id: 3,
      value: "частичная занятость",
      label: "Частичная занятость",
    },
    {
      id: 4,
      value: "стажировка",
      label: "Стажировка",
    },
  ];

  profileId: number = this.route.snapshot.params["projectId"];

  vacancies: Vacancy[] = [];
  vacancyForm: FormGroup;

  inlineSkills = signal<Skill[]>([]);

  nestedSkills$ = this.skillsService.getSkillsNested();

  skillsGroupsModalOpen = signal(false);

  vacancySubmitInitiated = false;
  vacancyIsSubmitting = false;

  selectedRequiredExperienceId = signal<number | undefined>(undefined);
  selectedWorkFormatId = signal<number | undefined>(undefined);
  selectedWorkScheduleId = signal<number | undefined>(undefined);

  onEditClicked = signal(false);

  submitVacancy(): void {
    this.vacancySubmitInitiated = true;

    const controls = [
      this.vacancyForm.get("role"),
      this.vacancyForm.get("description"),
      this.vacancyForm.get("skills"),
      this.vacancyForm.get("requiredExperience"),
      this.vacancyForm.get("workFormat"),
      this.vacancyForm.get("salary"),
      this.vacancyForm.get("workSchedule"),
    ];

    controls.filter(Boolean).forEach(control => {
      control?.addValidators([Validators.required]);
      control?.updateValueAndValidity({ emitEvent: false });
    });

    if (!this.validationService.getFormValidation(this.vacancyForm)) {
      controls.filter(Boolean).forEach(control => {
        console.debug("Submit vacancy error: ", control);
      });

      return;
    }

    this.vacancyIsSubmitting = true;

    const vacancy = {
      ...this.vacancyForm.value,
      requiredSkillsIds: this.vacancyForm.value.skills.map((s: Skill) => s.id),
      salary: +this.vacancyForm.get("salary")?.value,
    };

    this.vacancyService
      .postVacancy(Number(this.route.snapshot.paramMap.get("projectId")), vacancy)
      .subscribe({
        next: vacancy => {
          console.log(vacancy);
          this.vacancies.push(vacancy);
          console.log(this.vacancies);

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

  editVacancy(index: number): void {
    const vacancyItem = this.vacancies[index];

    this.experienceList.forEach(experience => {
      if (experience.value === vacancyItem.requiredExperience) {
        this.selectedRequiredExperienceId.set(experience.id);
      }
    });

    this.formatList.forEach(format => {
      if (format.value === vacancyItem.workFormat) {
        this.selectedWorkFormatId.set(format.id);
      }
    });

    this.scheludeList.forEach(schelude => {
      if (schelude.value === vacancyItem.workSchedule) {
        this.selectedWorkScheduleId.set(schelude.id);
      }
    });

    this.vacancyForm.patchValue({
      role: vacancyItem.role,
      skills: vacancyItem.requiredSkills,
      description: vacancyItem.description,
      requiredExperience: vacancyItem.requiredExperience,
      workFormat: vacancyItem.workFormat,
      salary: vacancyItem.salary,
      workSchedule: vacancyItem.workSchedule,
    });

    this.editIndex.set(index);

    this.onEditClicked.set(true);
  }

  navigateStep(step: string) {
    this.router.navigate([], { queryParams: { editingStep: step } });
    this.editingStep = step as "main" | "contacts" | "team" | "achievements" | "vacancies";
  }

  inviteForm: FormGroup;

  inviteSubmitInitiated = false;
  inviteFormIsSubmitting = false;

  inviteNotExistingError: Error | null = null;

  invites: Invite[] = [];

  submitInvite(): void {
    this.inviteSubmitInitiated = true;

    const controls = [this.inviteForm.get("role"), this.inviteForm.get("link")];

    controls.filter(Boolean).forEach(control => {
      if (control === this.inviteForm.get("link")) {
        control?.addValidators([
          Validators.pattern(/^http(s)?:\/\/.+(:[0-9]*)?\/office\/profile\/\d+$/),
        ]);
      }
      control?.addValidators([Validators.required]);
      control?.updateValueAndValidity({ emitEvent: false });
    });

    if (!this.validationService.getFormValidation(this.inviteForm)) {
      controls.filter(Boolean).forEach(control => {
        console.debug("Submit invite error: ", control);
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
        Number(this.route.snapshot.paramMap.get("projectId")),
        this.inviteForm.value.role
      )
      .subscribe({
        next: invite => {
          this.inviteFormIsSubmitting = false;
          this.inviteForm.reset();

          this.invites.push(invite);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 400) {
              this.inviteNotExistingError = error;
            }
          }
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

  projSubmitInitiated = false;

  projFormIsSubmittingAsPublished = false;
  projFormIsSubmittingAsDraft = false;

  setIsSubmittingAsPublished(status: boolean): void {
    this.projFormIsSubmittingAsPublished = status;
  }

  setIsSubmittingAsDraft(status: boolean): void {
    this.projFormIsSubmittingAsDraft = status;
  }

  setProjFormIsSubmitting!: (status: boolean) => void;

  achievementsItems = signal<any[]>([]);

  get achievements(): FormArray {
    return this.projectForm.get("achievements") as FormArray;
  }

  addAchievement(): void {
    const achievementItem = this.fb.group({
      id: this.achievements.length,
      title: this.projectForm.get("achievementsName")?.value,
      status: this.projectForm.get("achievementsPrize")?.value,
    });

    if (this.editIndex() !== null) {
      this.achievementsItems.update(items => {
        const updatedItems = [...items];
        updatedItems[this.editIndex()!] = achievementItem.value;

        this.achievements.at(this.editIndex()!).patchValue(achievementItem.value);
        return updatedItems;
      });
      this.editIndex.set(null);
    } else {
      this.achievementsItems.update(items => [...items, achievementItem.value]);
      this.achievements.push(achievementItem);
    }

    this.projectForm.get("achievementsName")?.reset();
    this.projectForm.get("achievementsPrize")?.reset();
  }

  editAchievement(index: number) {
    const achievementItem =
      this.achievementsItems().length > 0
        ? this.achievementsItems()[index]
        : this.achievements.value[index];

    this.projectForm.patchValue({
      achievementsName: achievementItem.title,
      achievementsPrize: achievementItem.status,
    });
    this.editIndex.set(index);
  }

  removeAchievement(i: number): void {
    this.achievementsItems.update(items => items.filter((_, index) => index !== i));

    this.achievements.removeAt(i);
  }

  clearAllValidationErrors(): void {
    Object.keys(this.projectForm.controls).forEach(ctrl => {
      this.projectForm.get(ctrl)?.setErrors(null);
    });
    this.clearAllAchievementsErrors();
  }

  clearAllAchievementsErrors(): void {
    this.achievements.controls.forEach(achievementForm => {
      Object.keys(achievementForm).forEach(ctrl => {
        this.projectForm.get(ctrl)?.setErrors(null);
      });
    });
  }

  saveProjectAsPublished(): void {
    this.projSubmitInitiated = true;
    this.projectForm.get("draft")?.patchValue(false);

    this.setProjFormIsSubmitting = this.setIsSubmittingAsPublished;
    const partnerProgramId = this.projectForm.get("partnerProgramId")?.value;
    this.projectForm.patchValue({ partnerProgramId: partnerProgramId });
    this.submitProjectForm();
  }

  saveProjectAsDraft(): void {
    this.clearAllValidationErrors();
    this.projectForm.get("draft")?.patchValue(true);

    this.setProjFormIsSubmitting = this.setIsSubmittingAsDraft;
    const partnerProgramId = this.projectForm.get("partnerProgramId")?.value;
    this.projectForm.patchValue({ partnerProgramId: partnerProgramId });
    this.submitProjectForm();
  }

  submitProjectForm(): void {
    this.achievements.controls.forEach(achievementForm => {
      achievementForm.markAllAsTouched();
    });

    if (!this.validationService.getFormValidation(this.projectForm)) {
      return;
    }

    if (!this.projectForm.get("industryId")?.value) {
      delete this.projectForm.value.industryId;
    }

    this.setProjFormIsSubmitting(true);

    this.projectService
      .updateProject(Number(this.route.snapshot.paramMap.get("projectId")), this.projectForm.value)
      .subscribe({
        next: () => {
          this.setProjFormIsSubmitting(false);
          this.router
            .navigateByUrl(`/office/projects/my`)
            .then(() => console.debug("Route changed from ProjectEditComponent"));
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 403) {
              if (error.error) {
                this.isCompleted = true;
                this.errorModalMessage.set(error.error);
                console.log(this.errorModalMessage()?.program_name);
              }
            }
          }
          this.setProjFormIsSubmitting(false);
        },
      });
  }

  editIndex = signal<number | null>(null);

  linksItems = signal<any[]>([]);

  get links(): FormArray {
    return this.projectForm.get("links") as FormArray;
  }

  addLink() {
    const linkValue = this.projectForm.get("link")?.value;

    const linkItem = this.fb.control(linkValue);

    if (this.editIndex() !== null) {
      this.linksItems.update(items => {
        const updatedItems = [...items];
        updatedItems[this.editIndex()!] = linkItem.value;

        this.links.at(this.editIndex()!).patchValue(linkItem.value);
        return updatedItems;
      });
      this.editIndex.set(null);
    } else {
      this.linksItems.update(items => [...items, linkItem.value]);
      this.links.push(linkItem);
    }

    this.projectForm.get("link")?.reset();
  }

  editLink(index: number) {
    const linkItem =
      this.linksItems().length > 0 ? this.linksItems()[index] : this.links.value[index];

    this.projectForm.patchValue({
      link: linkItem.link,
    });
    this.editIndex.set(index);
  }

  removeLink(i: number): void {
    this.linksItems.update(items => items.filter((_, index) => index !== i));

    this.links.removeAt(i);
  }

  warningModalSeen = false;

  closeWarningModal(): void {
    this.warningModalSeen = true;
  }

  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.vacancyForm.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;

    this.vacancyForm.patchValue({
      skills: skills.filter(skill => skill.id !== oddSkill.id),
    });
  }

  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }

  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }
}
