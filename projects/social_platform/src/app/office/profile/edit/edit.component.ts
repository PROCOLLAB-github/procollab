/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { AuthService } from "@auth/services";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ButtonComponent, IconComponent, InputComponent, SelectComponent } from "@ui/components";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { concatMap, first, map, noop, Observable, skip, Subscription, tap } from "rxjs";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { NavService } from "@services/nav.service";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe, CommonModule, Location } from "@angular/common";
import { Specialization } from "@office/models/specialization";
import { SpecializationsService } from "@office/services/specializations.service";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { SpecializationsGroupComponent } from "@office/shared/specializations-group/specializations-group.component";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { Skill } from "@office/models/skill";
import { SkillsService } from "@office/services/skills.service";
import { navItems } from "projects/core/src/consts/navProfileItems";
import { yearList } from "projects/core/src/consts/list-years";
import { educationUserLevel, educationUserType } from "projects/core/src/consts/list-education";
import { languageLevelsList, languageNamesList } from "projects/core/src/consts/list-language";

dayjs.extend(cpf);

@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    IconComponent,
    CommonModule,
    ButtonComponent,
    AvatarControlComponent,
    TextareaComponent,
    EditorSubmitButtonDirective,
    AsyncPipe,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    SkillsGroupComponent,
    SpecializationsGroupComponent,
    ModalComponent,
    SelectComponent,
    RouterModule,
  ],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private readonly cdref: ChangeDetectorRef,
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly specsService: SpecializationsService,
    private readonly skillsService: SkillsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
    private readonly location: Location
  ) {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: [""],
      userType: [0],
      birthday: ["", [Validators.required]],
      city: [""],
      phoneNumber: ["", Validators.required],
      additionalRole: [null],

      // education
      organizationName: [""],
      entryYear: [null],
      completionYear: [null],
      description: [null],
      educationLevel: [null],
      educationStatus: [null],

      // language
      language: [null],
      languageLevel: [null],

      education: this.fb.array([]),
      workExperience: this.fb.array([]),
      userLanguages: this.fb.array([]),
      links: this.fb.array([]),

      // work
      organization: [""],
      entryYearWork: [null],
      completionYearWork: [null],
      descriptionWork: [null],
      jobPosition: [null],

      // skills
      speciality: ["", [Validators.required]],
      skills: [[], [Validators.required]],
      achievements: this.fb.array([]),
      avatar: [""],
      aboutMe: [""],
      typeSpecific: this.fb.group({}),
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Редактирование профиля");

    const userType$ = this.profileForm
      .get("userType")
      ?.valueChanges.pipe(skip(1), concatMap(this.changeUserType.bind(this)))
      .subscribe(noop);

    userType$ && this.subscription$.push(userType$);

    const userAvatar$ = this.profileForm
      .get("avatar")
      ?.valueChanges.pipe(
        skip(1),
        concatMap(url => this.authService.saveAvatar(url))
      )
      .subscribe(noop);

    userAvatar$ && this.subscription$.push(userAvatar$);

    this.editingStep = this.route.snapshot.queryParams["editingStep"];
  }

  ngAfterViewInit() {
    const profile$ = this.authService.profile.pipe(first()).subscribe(profile => {
      this.profileId = profile.id;

      this.profileForm.patchValue({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        status: profile.userType ?? "",
        userType: profile.userType ?? 1,
        birthday: profile.birthday ? dayjs(profile.birthday).format("DD.MM.YYYY") : "",
        city: profile.city ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        additionalRole: profile.v2Speciality?.name ?? "",
        speciality: profile.speciality ?? "",
        skills: profile.skills ?? [],
        avatar: profile.avatar ?? "",
        aboutMe: profile.aboutMe ?? "",
      });

      this.workExperience.clear();
      profile.workExperience.forEach(work => {
        this.workExperience.push(
          this.fb.group({
            organizationName: work.organizationName,
            entryYear: work.entryYear,
            completionYear: work.completionYear,
            description: work.description,
            jobPosition: work.jobPosition,
          })
        );
      });

      this.education.clear();
      profile.education.forEach(edu => {
        this.education.push(
          this.fb.group({
            organizationName: edu.organizationName,
            entryYear: edu.entryYear,
            completionYear: edu.completionYear,
            description: edu.description,
            educationStatus: edu.educationStatus,
            educationLevel: edu.educationLevel,
          })
        );
      });

      this.userLanguages.clear();
      profile.userLanguages.forEach(lang => {
        this.userLanguages.push(
          this.fb.group({
            language: lang.language,
            languageLevel: lang.languageLevel,
          })
        );
      });

      this.cdref.detectChanges();

      profile.achievements.length &&
        profile.achievements?.forEach(achievement =>
          this.addAchievement(achievement.id, achievement.title, achievement.status)
        );

      profile.links.length && profile.links.forEach(l => this.addLink(l));

      if ([2, 3, 4].includes(profile.userType)) {
        this.typeSpecific?.addControl("preferredIndustries", this.fb.array([]));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        profile[this.userTypeMap[profile.userType]].preferredIndustries.forEach(
          (industry: string) => this.addPreferredIndustry(industry)
        );

        this.cdref.detectChanges();
      }

      if ([1, 3, 4].includes(profile.userType)) {
        const userTypeData = profile.member ?? profile.mentor ?? profile.expert;
        this.typeSpecific.addControl("usefulToProject", this.fb.control(""));
        this.typeSpecific.get("usefulToProject")?.patchValue(userTypeData?.usefulToProject);
        this.cdref.detectChanges();
      }

      this.cdref.detectChanges();
    });
    profile$ && this.subscription$.push(profile$);
  }

  ngOnDestroy(): void {
    this.subscription$.forEach($ => $.unsubscribe());
  }

  editingStep: "main" | "education" | "experience" | "achievements" | "skills" = "main";

  profileId?: number;

  inlineSpecs = signal<Specialization[]>([]);

  nestedSpecs$ = this.specsService.getSpecializationsNested();

  specsGroupsModalOpen = signal(false);

  inlineSkills = signal<Skill[]>([]);

  nestedSkills$ = this.skillsService.getSkillsNested();

  skillsGroupsModalOpen = signal(false);

  educationItems = signal<any[]>([]);

  workItems = signal<any[]>([]);

  languageItems = signal<any[]>([]);

  isModalErrorSkillsChoose = signal(false);
  isModalErrorSkillChooseText = signal("");

  editIndex = signal<number | null>(null);

  editEducationClick = false;
  editWorkClick = false;
  editLanguageClick = false;

  selectedEntryYearEducationId = signal<number | undefined>(undefined);
  selectedComplitionYearEducationId = signal<number | undefined>(undefined);
  selectedEducationStatusId = signal<number | undefined>(undefined);
  selectedEducationLevelId = signal<number | undefined>(undefined);

  selectedEntryYearWorkId = signal<number | undefined>(undefined);
  selectedComplitionYearWorkId = signal<number | undefined>(undefined);

  selectedLanguageId = signal<number | undefined>(undefined);
  selectedLanguageLevelId = signal<number | undefined>(undefined);

  subscription$: Subscription[] = [];

  readonly navItems = navItems;

  navigateStep(step: string) {
    this.router.navigate([], { queryParams: { editingStep: step } });
    this.editingStep = step as "main" | "education" | "experience" | "achievements" | "skills";
  }

  readonly yearListEducation = yearList;

  readonly educationStatusList = educationUserType;

  readonly educationLevelList = educationUserLevel;

  readonly languageList = languageNamesList;

  readonly languageLevelList = languageLevelsList;

  get typeSpecific(): FormGroup {
    return this.profileForm.get("typeSpecific") as FormGroup;
  }

  get usefulToProject(): FormControl {
    return this.typeSpecific.get("usefulToProject") as FormControl;
  }

  get preferredIndustries(): FormArray {
    return this.typeSpecific.get("preferredIndustries") as FormArray;
  }

  newPreferredIndustryTitle = "";

  addPreferredIndustry(title?: string): void {
    const fromState = title ?? this.newPreferredIndustryTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.preferredIndustries.push(control);

    this.newPreferredIndustryTitle = "";
  }

  removePreferredIndustry(i: number): void {
    this.preferredIndustries.removeAt(i);
  }

  get achievements(): FormArray {
    return this.profileForm.get("achievements") as FormArray;
  }

  get education(): FormArray {
    return this.profileForm.get("education") as FormArray;
  }

  get workExperience(): FormArray {
    return this.profileForm.get("workExperience") as FormArray;
  }

  get userLanguages(): FormArray {
    return this.profileForm.get("userLanguages") as FormArray;
  }

  errorMessage = ErrorMessage;

  roles: Observable<SelectComponent["options"]> = this.authService.changeableRoles.pipe(
    map(roles => roles.map(role => ({ id: role.id, value: role.id, label: role.name })))
  );

  profileFormSubmitting = false;
  profileForm: FormGroup;

  addAchievement(id?: number, title?: string, status?: string): void {
    this.achievements.push(
      this.fb.group({
        title: [title ?? "", [Validators.required]],
        status: [status ?? "", [Validators.required]],
        id: [id],
      })
    );
  }

  removeAchievement(i: number): void {
    this.achievements.removeAt(i);
  }

  addEducation() {
    const educationItem = this.fb.group({
      organizationName: this.profileForm.get("organizationName")?.value,
      entryYear: this.profileForm.get("entryYear")?.value,
      completionYear: this.profileForm.get("completionYear")?.value,
      description: this.profileForm.get("description")?.value,
      educationStatus: this.profileForm.get("educationStatus")?.value,
      educationLevel: this.profileForm.get("educationLevel")?.value,
    });

    const educationItemFilled = Object.values(educationItem.value).some(
      value => value !== null && value !== ""
    );

    if (educationItemFilled) {
      if (!educationItem.get("organizationName")?.value) {
        this.profileForm.get("organizationName")?.setValidators([Validators.required]);
        this.profileForm.get("organizationName")?.markAsTouched();
        this.profileForm.get("organizationName")?.updateValueAndValidity();
      } else {
        if (this.editIndex() !== null) {
          this.educationItems.update(items => {
            const updatedItems = [...items];
            updatedItems[this.editIndex()!] = educationItem.value;

            this.education.at(this.editIndex()!).patchValue(educationItem.value);
            return updatedItems;
          });
          this.editIndex.set(null);
        } else {
          this.educationItems.update(items => [...items, educationItem.value]);
          this.education.push(educationItem);
        }
        this.profileForm.get("organizationName")?.clearValidators();
        this.profileForm.get("organizationName")?.markAsPristine();
        this.profileForm.get("organizationName")?.updateValueAndValidity();

        this.profileForm.get("organizationName")?.reset();
        this.profileForm.get("entryYear")?.setValue("");
        this.profileForm.get("completionYear")?.setValue("");
        this.profileForm.get("description")?.setValue("");
        this.profileForm.get("educationStatus")?.setValue("");
        this.profileForm.get("educationLevel")?.setValue("");
      }
    }
    this.editEducationClick = false;
  }

  editEducation(index: number) {
    this.editEducationClick = true;
    const educationItem = this.education.value[index];

    this.yearListEducation.forEach(entryYearWork => {
      if (entryYearWork.value === educationItem.entryYear) {
        this.selectedEntryYearEducationId.set(entryYearWork.id);
      }
    });

    this.yearListEducation.forEach(completionYearWork => {
      if (completionYearWork.value === educationItem.completionYear) {
        this.selectedComplitionYearEducationId.set(completionYearWork.id);
      }
    });

    this.educationLevelList.forEach(educationLevel => {
      if (educationLevel.value === educationItem.educationLevel) {
        this.selectedEducationLevelId.set(educationLevel.id);
      }
    });

    this.educationStatusList.forEach(educationStatus => {
      if (educationStatus.value === educationItem.educationStatus) {
        this.selectedEducationStatusId.set(educationStatus.id);
      }
    });

    this.profileForm.patchValue({
      organizationName: educationItem.organizationName,
      entryYear: educationItem.entryYear,
      completionYear: educationItem.completionYear,
      description: educationItem.description,
      educationStatus: educationItem.educationStatus,
      educationLevel: educationItem.educationLevel,
    });
    this.editIndex.set(index);
  }

  removeEducation(i: number) {
    this.educationItems.update(items => items.filter((_, index) => index !== i));

    this.education.removeAt(i);
  }

  addWork() {
    const workItem = this.fb.group({
      organizationName: this.profileForm.get("organization")?.value,
      entryYear: this.profileForm.get("entryYearWork")?.value,
      completionYear: this.profileForm.get("completionYearWork")?.value,
      description: this.profileForm.get("descriptionWork")?.value,
      jobPosition: this.profileForm.get("jobPosition")?.value,
    });

    const workItemFilled = Object.values(workItem.value).some(
      value => value !== null && value !== ""
    );

    if (workItemFilled) {
      if (!workItem.get("organizationName")?.value) {
        this.profileForm.get("organization")?.setValidators([Validators.required]);
        this.profileForm.get("organization")?.markAsTouched();
        this.profileForm.get("organization")?.updateValueAndValidity();
      } else {
        if (this.editIndex() !== null) {
          this.workItems.update(items => {
            const updatedItems = [...items];
            updatedItems[this.editIndex()!] = workItem.value;

            this.workExperience.at(this.editIndex()!).patchValue(workItem.value);
            return updatedItems;
          });
          this.editIndex.set(null);
        } else {
          this.workItems.update(items => [...items, workItem.value]);
          this.workExperience.push(workItem);
        }

        this.profileForm.get("organization")?.clearValidators();
        this.profileForm.get("organization")?.markAsPristine();
        this.profileForm.get("organization")?.updateValueAndValidity();

        this.profileForm.get("organization")?.reset();
        this.profileForm.get("entryYearWork")?.setValue("");
        this.profileForm.get("completionYearWork")?.setValue("");
        this.profileForm.get("descriptionWork")?.setValue("");
        this.profileForm.get("jobPosition")?.setValue("");
      }
    }
    this.editWorkClick = false;
  }

  editWork(index: number) {
    this.editWorkClick = true;
    const workItem = this.workExperience.value[index];

    if (workItem) {
      this.yearListEducation.forEach(entryYearWork => {
        if (
          entryYearWork.value === workItem.entryYearWork ||
          entryYearWork.value === workItem.entryYear
        ) {
          this.selectedEntryYearWorkId.set(entryYearWork.id);
        }
      });

      this.yearListEducation.forEach(complitionYearWork => {
        if (
          complitionYearWork.value === workItem.completionYearWork ||
          complitionYearWork.value === workItem.completionYear
        ) {
          this.selectedComplitionYearWorkId.set(complitionYearWork.id);
        }
      });

      this.profileForm.patchValue({
        organization: workItem.organization || workItem.organizationName,
        entryYearWork: workItem.entryYearWork || workItem.entryYear,
        completionYearWork: workItem.completionYearWork || workItem.completionYear,
        descriptionWork: workItem.descriptionWork || workItem.description,
        jobPosition: workItem.jobPosition,
      });
      this.editIndex.set(index);
    }
  }

  removeWork(i: number) {
    this.workItems.update(items => items.filter((_, index) => index !== i));

    this.workExperience.removeAt(i);
  }

  addLanguage() {
    const languageItem = this.fb.group({
      language: this.profileForm.get("language")?.value,
      languageLevel: this.profileForm.get("languageLevel")?.value,
    });

    if (this.editIndex() !== null) {
      this.languageItems.update(items => {
        const updatedItems = [...items];
        updatedItems[this.editIndex()!] = languageItem.value;

        this.userLanguages.at(this.editIndex()!).patchValue(languageItem.value);
        return updatedItems;
      });
      this.editIndex.set(null);
    } else {
      this.languageItems.update(items => [...items, languageItem.value]);
      this.userLanguages.push(languageItem);
    }

    this.profileForm.get("language")?.reset();
    this.profileForm.get("languageLevel")?.reset();

    this.editLanguageClick = true;
  }

  editLanguage(index: number) {
    this.editLanguageClick = true;
    const languageItem = this.userLanguages.value[index];

    this.languageList.forEach(language => {
      if (language.value === languageItem.language) {
        this.selectedLanguageId.set(language.id);
      }
    });

    this.languageLevelList.forEach(languageLevel => {
      if (languageLevel.value === languageItem.languageLevel) {
        this.selectedLanguageLevelId.set(languageLevel.id);
      }
    });

    this.profileForm.patchValue({
      language: languageItem.language,
      languageLevel: languageItem.languageLevel,
    });

    this.editIndex.set(index);
  }

  removeLanguage(i: number) {
    this.languageItems.update(items => items.filter((_, index) => index !== i));

    this.userLanguages.removeAt(i);
  }

  get links(): FormArray {
    return this.profileForm.get("links") as FormArray;
  }

  newLink = "";

  addLink(title?: string): void {
    const fromState = title ?? this.newLink;

    const control = this.fb.control(fromState, [Validators.required]);
    this.links.push(control);

    this.newLink = "";
  }

  removeLink(i: number): void {
    this.links.removeAt(i);
  }

  private userTypeMap: { [type: number]: string } = {
    1: "member",
    2: "mentor",
    3: "expert",
    4: "investor",
  };

  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.profileForm) || this.profileFormSubmitting) {
      return;
    }

    this.profileFormSubmitting = true;

    const newProfile = {
      ...this.profileForm.value,
      [this.userTypeMap[this.profileForm.value.userType]]: this.typeSpecific.value,
      typeSpecific: undefined,
      birthday: this.profileForm.value.birthday
        ? dayjs(this.profileForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
      skillsIds: this.profileForm.value.skills.map((s: Skill) => s.id),
    };

    this.authService
      .saveProfile(newProfile)
      .pipe(concatMap(() => this.authService.getProfile()))
      .subscribe({
        next: () => {
          this.profileFormSubmitting = false;
          this.router
            .navigateByUrl(`/office/profile/${this.profileId}`)
            .then(() => console.debug("Router Changed form ProfileEditComponent"));
        },
        error: error => {
          this.profileFormSubmitting = false;
          this.isModalErrorSkillsChoose.set(true);
          this.isModalErrorSkillChooseText.set(error.error[0]);
        },
      });
  }

  changeUserType(typeId: number): Observable<void> {
    return this.authService
      .saveProfile({
        email: this.profileForm.value.email,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        userType: typeId,
      })
      .pipe(map(() => location.reload()));
  }

  onSelectSpec(speciality: Specialization): void {
    this.profileForm.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.specsService.getSpecializationsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSpecs.set(results);
    });
  }

  toggleSpecsGroupsModal(): void {
    this.specsGroupsModalOpen.update(open => !open);
  }

  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.profileForm.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    this.profileForm.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }

  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  onBack() {
    this.location.back();
  }
}
