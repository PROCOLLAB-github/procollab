/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
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
import { concatMap, first, map, noop, Observable, skip, Subscription } from "rxjs";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { NavService } from "@services/nav.service";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
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
import { educationUserLevel, educationUserType } from "projects/core/src/consts/list-education";
import { languageLevelsList, languageNamesList } from "projects/core/src/consts/list-language";
import { transformYearStringToNumber } from "@utils/transformYear";
import { yearRangeValidators } from "@utils/yearRangeValidators";
import { User } from "@auth/models/user.model";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { generateOptionsList } from "@utils/generate-options-list";

dayjs.extend(cpf);

/**
 * Компонент редактирования профиля пользователя
 *
 * Этот компонент предоставляет полнофункциональную форму для редактирования профиля пользователя
 * с поддержкой множественных разделов (основная информация, образование, опыт работы, достижения, навыки).
 *
 * Основные возможности:
 * - Редактирование основной информации (имя, фамилия, дата рождения, город, телефон)
 * - Управление образованием (добавление, редактирование, удаление записей об образовании)
 * - Управление опытом работы (добавление, редактирование, удаление записей о работе)
 * - Управление языками (добавление, редактирование, удаление языковых навыков)
 * - Управление достижениями (добавление, редактирование, удаление достижений)
 * - Управление навыками через автокомплит и модальные окна с группировкой
 * - Загрузка и обновление аватара пользователя
 * - Пошаговая навигация между разделами формы
 * - Валидация всех полей формы с отображением ошибок
 *
 * @implements OnInit - для инициализации компонента и подписок
 * @implements OnDestroy - для очистки подписок
 * @implements AfterViewInit - для работы с DOM после инициализации представления
 */
@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    SelectComponent,
    IconComponent,
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
    SwitchComponent,
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
    private readonly navService: NavService
  ) {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.email, Validators.max(50)]],
      userType: [0],
      birthday: ["", [Validators.required]],
      city: ["", Validators.max(100)],
      phoneNumber: [""],
      additionalRole: [null],

      // education
      organizationName: ["", Validators.max(100)],
      entryYear: [null],
      completionYear: [null],
      description: [null, Validators.max(1000)],
      educationLevel: [null],
      educationStatus: [""],
      isMospolytechStudent: [false],
      studyGroup: ["", Validators.max(10)],

      // language
      language: [null],
      languageLevel: [null],

      education: this.fb.array([]),
      workExperience: this.fb.array([]),
      userLanguages: this.fb.array([]),
      links: this.fb.array([]),

      // work
      organization: ["", Validators.max(100)],
      entryYearWork: [null],
      completionYearWork: [null],
      descriptionWork: [null, Validators.max(1000)],
      jobPosition: [""],

      // skills
      speciality: ["", [Validators.required]],
      skills: [[]],
      achievements: this.fb.array([]),
      avatar: [""],
      aboutMe: [""],
      typeSpecific: this.fb.group({}),
    });
  }

  /**
   * Инициализация компонента
   * Настраивает форму, подписки на изменения, валидацию и заголовок навигации
   */
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

    const isMospolytechStudentSub$ = this.profileForm
      .get("isMospolytechStudent")
      ?.valueChanges.subscribe(isStudent => {
        const studyGroup = this.profileForm.get("studyGroup");
        if (isStudent) {
          studyGroup?.setValidators([Validators.required]);
        } else {
          studyGroup?.clearValidators();
        }

        studyGroup?.updateValueAndValidity();
      });

    isMospolytechStudentSub$ && this.subscription$.push(isMospolytechStudentSub$);

    this.editingStep = this.route.snapshot.queryParams["editingStep"];
  }

  /**
   * Инициализация после создания представления
   * Загружает данные профиля пользователя и заполняет форму
   */
  ngAfterViewInit() {
    const profile$ = this.authService.profile.pipe(first()).subscribe((profile: User) => {
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
        isMospolytechStudent: profile.isMospolytechStudent ?? false,
        studyGroup: profile.studyGroup ?? "",
      });

      this.workExperience.clear();
      profile.workExperience.forEach(work => {
        this.workExperience.push(
          this.fb.group(
            {
              organizationName: work.organizationName,
              entryYear: work.entryYear,
              completionYear: work.completionYear,
              description: work.description,
              jobPosition: work.jobPosition,
            },
            {
              validators: yearRangeValidators("entryYear", "completionYear"),
            }
          )
        );
      });

      this.education.clear();
      profile.education.forEach(edu => {
        this.education.push(
          this.fb.group(
            {
              organizationName: edu.organizationName,
              entryYear: edu.entryYear,
              completionYear: edu.completionYear,
              description: edu.description,
              educationStatus: edu.educationStatus,
              educationLevel: edu.educationLevel,
            },
            {
              validators: yearRangeValidators("entryYear", "completionYear"),
            }
          )
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

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
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

  /**
   * Навигация между шагами редактирования профиля
   * @param step - название шага ('main' | 'education' | 'experience' | 'achievements' | 'skills')
   */
  navigateStep(step: string) {
    this.router.navigate([], { queryParams: { editingStep: step } });
    this.editingStep = step as "main" | "education" | "experience" | "achievements" | "skills";
  }

  isStudentMosPolytech(): void {
    const ctl = this.profileForm.get("isMospolytechStudent");
    ctl?.setValue(!ctl.value);
  }

  readonly yearListEducation = generateOptionsList(55, "years");

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

  get isEducationDirty(): boolean {
    const f = this.profileForm;
    return [
      "organizationName",
      "entryYear",
      "completionYear",
      "description",
      "educationStatus",
      "educationLevel",
    ].some(name => f.get(name)?.dirty);
  }

  get isWorkDirty(): boolean {
    const f = this.profileForm;
    return [
      "organization",
      "entryYearWork",
      "completionYearWork",
      "descriptionWork",
      "jobPosition",
    ].some(name => f.get(name)?.dirty);
  }

  get isLanguageDirty(): boolean {
    const f = this.profileForm;
    return ["language", "languageLevel"].some(name => f.get(name)?.dirty);
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

  /**
   * Добавление записи об образовании
   * Валидирует форму и добавляет новую запись в массив образования
   */
  addEducation() {
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.clearValidators()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.updateValueAndValidity()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.markAsTouched()
    );

    const entryYear =
      typeof this.profileForm.get("entryYear")?.value === "string"
        ? +this.profileForm.get("entryYear")?.value.slice(0, 5)
        : this.profileForm.get("entryYear")?.value;
    const completionYear =
      typeof this.profileForm.get("completionYear")?.value === "string"
        ? +this.profileForm.get("completionYear")?.value.slice(0, 5)
        : this.profileForm.get("completionYear")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set("Год начала обучения должен быть меньше года окончания");
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.profileForm.get("organizationName")?.value,
      entryYear,
      completionYear,
      description: this.profileForm.get("description")?.value,
      educationStatus: this.profileForm.get("educationStatus")?.value,
      educationLevel: this.profileForm.get("educationLevel")?.value,
    });

    const isOrganizationValid = this.profileForm.get("organizationName")?.valid;
    const isStatusValid = this.profileForm.get("educationStatus")?.valid;

    if (isOrganizationValid && isStatusValid) {
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
      [
        "organizationName",
        "entryYear",
        "completionYear",
        "description",
        "educationStatus",
        "educationLevel",
      ].forEach(name => {
        this.profileForm.get(name)?.reset();
        this.profileForm.get(name)?.setValue("");
        this.profileForm.get(name)?.clearValidators();
        this.profileForm.get(name)?.markAsPristine();
        this.profileForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editEducationClick = false;
  }

  /**
   * Редактирование записи об образовании
   * @param index - индекс записи в массиве образования
   */
  editEducation(index: number) {
    this.editEducationClick = true;
    const educationItem = this.education.value[index];

    this.yearListEducation.forEach(entryYearWork => {
      if (transformYearStringToNumber(entryYearWork.value as string) === educationItem.entryYear) {
        this.selectedEntryYearEducationId.set(entryYearWork.id);
      }
    });

    this.yearListEducation.forEach(completionYearWork => {
      if (
        transformYearStringToNumber(completionYearWork.value as string) ===
        educationItem.completionYear
      ) {
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

  /**
   * Удаление записи об образовании
   * @param i - индекс записи для удаления
   */
  removeEducation(i: number) {
    this.educationItems.update(items => items.filter((_, index) => index !== i));

    this.education.removeAt(i);
  }

  /**
   * Добавление записи об опыте работы
   * Валидирует форму и добавляет новую запись в массив опыта работы
   */
  addWork() {
    ["organization", "jobPosition"].forEach(name => this.profileForm.get(name)?.clearValidators());
    ["organization", "jobPosition"].forEach(name =>
      this.profileForm.get(name)?.setValidators([Validators.required])
    );
    ["organization", "jobPosition"].forEach(name =>
      this.profileForm.get(name)?.updateValueAndValidity()
    );
    ["organization", "jobPosition"].forEach(name => this.profileForm.get(name)?.markAsTouched());

    const entryYear =
      typeof this.profileForm.get("entryYearWork")?.value === "string"
        ? this.profileForm.get("entryYearWork")?.value.slice(0, 5)
        : this.profileForm.get("entryYearWork")?.value;
    const completionYear =
      typeof this.profileForm.get("completionYearWork")?.value === "string"
        ? this.profileForm.get("completionYearWork")?.value.slice(0, 5)
        : this.profileForm.get("completionYearWork")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set("Год начала работы должен быть меньше года окончания");
      return;
    }

    const workItem = this.fb.group({
      organizationName: this.profileForm.get("organization")?.value,
      entryYear,
      completionYear,
      description: this.profileForm.get("descriptionWork")?.value,
      jobPosition: this.profileForm.get("jobPosition")?.value,
    });

    const isOrganizationValid = this.profileForm.get("organization")?.valid;
    const isPositionValid = this.profileForm.get("jobPosition")?.valid;

    if (isOrganizationValid && isPositionValid) {
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
      [
        "organization",
        "entryYearWork",
        "completionYearWork",
        "descriptionWork",
        "jobPosition",
      ].forEach(name => {
        this.profileForm.get(name)?.reset();
        this.profileForm.get(name)?.setValue("");
        this.profileForm.get(name)?.clearValidators();
        this.profileForm.get(name)?.markAsPristine();
        this.profileForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editWorkClick = false;
  }

  editWork(index: number) {
    this.editWorkClick = true;
    const workItem = this.workExperience.value[index];

    if (workItem) {
      this.yearListEducation.forEach(entryYearWork => {
        if (
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYearWork ||
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYear
        ) {
          this.selectedEntryYearWorkId.set(entryYearWork.id);
        }
      });

      this.yearListEducation.forEach(complitionYearWork => {
        if (
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYearWork ||
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYear
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
    const languageValue = this.profileForm.get("language")?.value;
    const languageLevelValue = this.profileForm.get("languageLevel")?.value;

    ["language", "languageLevel"].forEach(name => {
      this.profileForm.get(name)?.clearValidators();
    });

    if ((languageValue && !languageLevelValue) || (!languageValue && languageLevelValue)) {
      ["language", "languageLevel"].forEach(name => {
        this.profileForm.get(name)?.setValidators([Validators.required]);
      });
    }

    ["language", "languageLevel"].forEach(name => {
      this.profileForm.get(name)?.updateValueAndValidity();
      this.profileForm.get(name)?.markAsTouched();
    });

    const isLanguageValid = this.profileForm.get("language")?.valid;
    const isLanguageLevelValid = this.profileForm.get("languageLevel")?.valid;

    if (!isLanguageValid || !isLanguageLevelValid) {
      return;
    }

    const languageItem = this.fb.group({
      language: languageValue,
      languageLevel: languageLevelValue,
    });

    if (languageValue && languageLevelValue) {
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

      ["language", "languageLevel"].forEach(name => {
        this.profileForm.get(name)?.reset();
        this.profileForm.get(name)?.setValue(null);
        this.profileForm.get(name)?.clearValidators();
        this.profileForm.get(name)?.markAsPristine();
        this.profileForm.get(name)?.updateValueAndValidity();
      });

      this.editLanguageClick = false;
    }
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

  /**
   * Сохранение профиля пользователя
   * Валидирует всю форму и отправляет данные на сервер
   */
  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.profileForm) || this.profileFormSubmitting) {
      this.isModalErrorSkillsChoose.set(true);
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
      phoneNumber:
        typeof this.profileForm.value.phoneNumber === "string"
          ? this.profileForm.value.phoneNumber.replace(/^([87])/, "+7")
          : this.profileForm.value.phoneNumber,
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
          if (error.error.phone_number) {
            this.isModalErrorSkillChooseText.set(error.error.phone_number[0]);
          } else if (error.error.language) {
            this.isModalErrorSkillChooseText.set(error.error.language);
          } else {
            this.isModalErrorSkillChooseText.set(error.error[0]);
          }
        },
      });
  }

  /**
   * Изменение типа пользователя
   * @param typeId - новый тип пользователя
   * @returns Observable<void> - результат операции изменения типа
   */
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

  /**
   * Выбор специальности из автокомплита
   * @param speciality - выбранная специальность
   */
  onSelectSpec(speciality: Specialization): void {
    this.profileForm.patchValue({ speciality: speciality.name });
  }

  /**
   * Поиск специальностей для автокомплита
   * @param query - поисковый запрос
   */
  onSearchSpec(query: string): void {
    this.specsService.getSpecializationsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSpecs.set(results);
    });
  }

  /**
   * Переключение навыка (добавление/удаление)
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  /**
   * Добавление нового навыка
   * @param newSkill - новый навык для добавления
   */
  onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.profileForm.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.profileForm.patchValue({ skills: [newSkill, ...skills] });
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
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

  toggleSpecsGroupsModal(): void {
    this.specsGroupsModalOpen.update(open => !open);
  }
}
