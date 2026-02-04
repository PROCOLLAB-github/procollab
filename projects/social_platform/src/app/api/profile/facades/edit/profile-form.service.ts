/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { concatMap, first, map, Observable, skip, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../auth";
import dayjs from "dayjs";
import { yearRangeValidators } from "@utils/helpers/yearRangeValidators";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { SelectComponent } from "@ui/components";
import { generateOptionsList } from "@utils/generate-options-list";
import {
  educationUserLevel,
  educationUserType,
} from "projects/core/src/consts/lists/education-info-list.const";
import {
  languageLevelsList,
  languageNamesList,
} from "projects/core/src/consts/lists/language-info-list.const";

@Injectable({ providedIn: "root" })
export class ProfileFormService {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  private profileForm!: FormGroup;

  readonly inlineSpecs = signal<Specialization[]>([]);
  readonly profileId = signal<number | undefined>(undefined);

  readonly roles = signal<SelectComponent["options"]>([]);

  readonly newPreferredIndustryTitle = signal<string>("");

  readonly yearListEducation = generateOptionsList(55, "years").reverse();
  readonly educationStatusList = educationUserType;
  readonly educationLevelList = educationUserLevel;

  readonly achievementsYearList = generateOptionsList(25, "years");

  readonly languageList = languageNamesList;
  readonly languageLevelList = languageLevelsList;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    this.initializeProfileForm();

    this.authService.changeableRoles
      .pipe(
        map(roles => roles.map(role => ({ id: role.id, value: role.id, label: role.name }))),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: roles => {
          this.roles.set(roles);
        },
      });
  }

  private initializeProfileForm(): void {
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.email, Validators.maxLength(50)]],
      userType: [0],
      birthday: ["", [Validators.required]],
      city: ["", [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ["", Validators.maxLength(12)],
      additionalRole: [null],
      coverImageAddress: [null],

      // education
      organizationName: ["", Validators.maxLength(100)],
      entryYear: [null],
      completionYear: [null],
      description: [null, Validators.maxLength(400)],
      educationLevel: [null],
      educationStatus: [""],
      isMospolytechStudent: [false],
      studyGroup: ["", Validators.maxLength(10)],

      // language
      language: [null],
      languageLevel: [null],

      // achievements
      title: [null],
      status: [null],
      year: [null],
      files: [""],

      education: this.fb.array([]),
      workExperience: this.fb.array([]),
      userLanguages: this.fb.array([]),
      links: this.fb.array([]),
      achievements: this.fb.array([]),

      // work
      organization: ["", Validators.maxLength(50)],
      entryYearWork: [null],
      completionYearWork: [null],
      descriptionWork: [null, Validators.maxLength(400)],
      jobPosition: [""],

      // skills
      speciality: ["", [Validators.required]],
      skills: [[]],
      avatar: [""],
      aboutMe: ["", Validators.maxLength(300)],
      typeSpecific: this.fb.group({}),
    });

    this.profileForm
      .get("userType")
      ?.valueChanges.pipe(
        skip(1),
        concatMap(this.changeUserType.bind(this)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.profileForm
      .get("avatar")
      ?.valueChanges.pipe(
        skip(1),
        concatMap(url => this.authService.saveAvatar(url)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public initializeProfileData(): void {
    this.authService.profile.pipe(first(), takeUntil(this.destroy$)).subscribe((profile: User) => {
      this.profileId.set(profile.id);

      this.profileForm.patchValue({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        userType: profile.userType ?? 1,
        birthday: profile.birthday ? dayjs(profile.birthday).format("DD.MM.YYYY") : "",
        city: profile.city ?? "",
        coverImageAddress: profile.coverImageAddress ?? "",
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

      this.achievements.clear();
      profile.achievements.forEach(achievement => {
        this.achievements.push(
          this.fb.group({
            id: [achievement.id],
            title: [achievement.title, Validators.required],
            status: [achievement.status, Validators.required],
            year: [achievement.year, Validators.required],
            files: [achievement.files ?? []],
          })
        );
      });

      profile.links.length && profile.links.forEach(l => this.addLink(l));

      if ([2, 3, 4].includes(profile.userType)) {
        this.typeSpecific?.addControl("preferredIndustries", this.fb.array([]));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        profile[this.userTypeMap[profile.userType]].preferredIndustries.forEach(
          (industry: string) => this.addPreferredIndustry(industry)
        );
      }

      if ([1, 3, 4].includes(profile.userType)) {
        const userTypeData = profile.member ?? profile.mentor ?? profile.expert;
        this.typeSpecific.addControl("usefulToProject", this.fb.control(""));
        this.typeSpecific.get("usefulToProject")?.patchValue(userTypeData?.usefulToProject);
      }
    });
  }

  /**
   * Возвращает основную форму проекта.
   * @returns FormGroup экземпляр формы проекта
   */
  public getForm(): FormGroup {
    return this.profileForm;
  }

  get avatar(): FormControl {
    return this.profileForm.get("avatar") as FormControl;
  }

  get coverImageAddress(): FormControl {
    return this.profileForm.get("coverImageAddress") as FormControl;
  }

  get firstName(): FormControl {
    return this.profileForm.get("firstName") as FormControl;
  }

  get lastName(): FormControl {
    return this.profileForm.get("lastName") as FormControl;
  }

  get city(): FormControl {
    return this.profileForm.get("city") as FormControl;
  }

  get birthday(): FormControl {
    return this.profileForm.get("birthday") as FormControl;
  }

  get userType(): FormControl {
    return this.profileForm.get("userType") as FormControl;
  }

  get speciality(): FormControl {
    return this.profileForm.get("speciality") as FormControl;
  }

  get aboutMe(): FormControl {
    return this.profileForm.get("aboutMe") as FormControl;
  }

  get phoneNumber(): FormControl {
    return this.profileForm.get("phoneNumber") as FormControl;
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

  get links(): FormArray {
    return this.profileForm.get("links") as FormArray;
  }

  get typeSpecific(): FormGroup {
    return this.profileForm.get("typeSpecific") as FormGroup;
  }

  get usefulToProject(): FormControl {
    return this.typeSpecific.get("usefulToProject") as FormControl;
  }

  get preferredIndustries(): FormArray {
    return this.typeSpecific.get("preferredIndustries") as FormArray;
  }

  addPreferredIndustry(title?: string): void {
    const fromState = title ?? this.newPreferredIndustryTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.preferredIndustries.push(control);

    this.newPreferredIndustryTitle.set("");
  }

  removePreferredIndustry(i: number): void {
    this.preferredIndustries.removeAt(i);
  }

  protected readonly newLink = signal<string>("");

  addLink(title?: string): void {
    const fromState = title ?? this.newLink;

    const control = this.fb.control(fromState, [Validators.required]);
    this.links.push(control);

    this.newLink.set("");
  }

  removeLink(i: number): void {
    this.links.removeAt(i);
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
      .pipe(
        map(() => location.reload()),
        takeUntil(this.destroy$)
      );
  }
}
