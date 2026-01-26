/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { generateOptionsList } from "@utils/generate-options-list";
import { transformYearStringToNumber } from "@utils/helpers/transformYear";
import { yearRangeValidators } from "@utils/helpers/yearRangeValidators";
import {
  educationUserLevel,
  educationUserType,
} from "projects/core/src/consts/lists/education-info-list.const";
import {
  languageLevelsList,
  languageNamesList,
} from "projects/core/src/consts/lists/language-info-list.const";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

@Injectable()
export class OnboardingStageZeroUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly profile = signal<User | undefined>(undefined);

  readonly educationItems = signal<any[]>([]);
  readonly workItems = signal<any[]>([]);
  readonly languageItems = signal<any[]>([]);

  readonly editIndex = signal<number | null>(null);
  readonly editEducationClick = signal<boolean>(false);
  readonly editWorkClick = signal<boolean>(false);
  readonly editLanguageClick = signal<boolean>(false);

  readonly selectedEntryYearEducationId = signal<number | undefined>(undefined);
  readonly selectedComplitionYearEducationId = signal<number | undefined>(undefined);
  readonly selectedEducationStatusId = signal<number | undefined>(undefined);
  readonly selectedEducationLevelId = signal<number | undefined>(undefined);

  readonly selectedEntryYearWorkId = signal<number | undefined>(undefined);
  readonly selectedComplitionYearWorkId = signal<number | undefined>(undefined);

  readonly selectedLanguageId = signal<number | undefined>(undefined);
  readonly selectedLanguageLevelId = signal<number | undefined>(undefined);

  readonly isModalErrorYear = signal<boolean>(false);
  readonly isModalErrorYearText = signal("");

  readonly yearListEducation = generateOptionsList(55, "years");
  readonly educationStatusList = educationUserType;
  readonly educationLevelList = educationUserLevel;

  readonly languageList = languageNamesList;
  readonly languageLevelList = languageLevelsList;

  readonly stageForm = this.fb.nonNullable.group({
    avatar: ["", [Validators.required]],
    city: ["", [Validators.required]],

    education: this.fb.array([]),
    workExperience: this.fb.array([]),
    userLanguages: this.fb.array([]),
    achievements: this.fb.array([]),

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

    // language
    language: [null],
    languageLevel: [null],
  });

  readonly achievements = this.stageForm.get("achievements") as FormArray;
  readonly education = this.stageForm.get("education") as FormArray;
  readonly workExperience = this.stageForm.get("workExperience") as FormArray;
  readonly userLanguages = this.stageForm.get("userLanguages") as FormArray;

  applySetProfile(p: User): void {
    this.profile.set(p);
  }

  applyInitStageZero(fv: Partial<User>): void {
    this.stageForm.patchValue({
      avatar: fv.avatar,
      city: fv.city,
      education: fv.education,
      workExperience: fv.workExperience,
    });
  }

  applyInitFormValues(fv: Partial<User>): void {
    this.stageForm.patchValue({
      avatar: fv.avatar ?? "",
      city: fv.city ?? "",
    });
  }

  applyInitWorkExperience(formValues: Partial<User>): void {
    this.workExperience.clear();
    formValues.workExperience?.forEach(work => {
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
  }

  applyInitEducation(formValues: Partial<User>): void {
    this.education.clear();
    formValues?.education?.forEach(edu => {
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
  }

  applyInitUserLanguages(formValues: Partial<User>): void {
    this.userLanguages.clear();
    formValues.userLanguages?.forEach(lang => {
      this.userLanguages.push(
        this.fb.group({
          language: lang.language,
          languageLevel: lang.languageLevel,
        })
      );
    });
  }

  applyInitAchievements(formValues: Partial<User>): void {
    formValues.achievements?.length &&
      formValues.achievements?.forEach(achievement =>
        this.addAchievement(achievement.id, achievement.title, achievement.status)
      );
  }

  addEducation() {
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.clearValidators()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.updateValueAndValidity()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.markAsTouched()
    );

    const valEntry = this.stageForm.get("entryYear")?.value as string | null;
    const entryYear = typeof valEntry === "string" ? +valEntry.slice(0, 5) : valEntry;

    const valCompletion = this.stageForm.get("completionYear")?.value as string | null;
    const completionYear =
      typeof valCompletion === "string" ? +valCompletion.slice(0, 5) : valCompletion;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.applyYearModalError();
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.stageForm.get("organizationName")?.value,
      entryYear,
      completionYear,
      description: this.stageForm.get("description")?.value,
      educationStatus: this.stageForm.get("educationStatus")?.value,
      educationLevel: this.stageForm.get("educationLevel")?.value,
    });

    const isOrganizationValid = this.stageForm.get("organizationName")?.valid;
    const isStatusValid = this.stageForm.get("educationStatus")?.valid;

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
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue("");
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editEducationClick.set(false);
  }

  editEducation(index: number) {
    this.editEducationClick.set(true);
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

    this.stageForm.patchValue({
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
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.clearValidators()
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.updateValueAndValidity()
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.markAsTouched()
    );

    const valEntry = this.stageForm.get("entryYearWork")?.value as string | null;
    const entryYear = typeof valEntry === "string" ? +valEntry.slice(0, 5) : valEntry;

    const valCompletion = this.stageForm.get("completionYearWork")?.value as string | null;
    const completionYear =
      typeof valCompletion === "string" ? +valCompletion.slice(0, 5) : valCompletion;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorYear.set(true);
      this.isModalErrorYearText.set("Год начала работы должен быть меньше года окончания");
      return;
    }

    const workItem = this.fb.group({
      organizationName: this.stageForm.get("organizationNameWork")?.value,
      entryYear,
      completionYear,
      description: this.stageForm.get("descriptionWork")?.value,
      jobPosition: this.stageForm.get("jobPosition")?.value,
    });

    const isOrganizationValid = this.stageForm.get("organizationNameWork")?.valid;
    const isPositionValid = this.stageForm.get("jobPosition")?.valid;

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
        "organizationNameWork",
        "entryYearWork",
        "completionYearWork",
        "descriptionWork",
        "jobPosition",
      ].forEach(name => {
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue("");
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editWorkClick.set(false);
  }

  editWork(index: number) {
    this.editWorkClick.set(true);
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

      this.stageForm.patchValue({
        organizationNameWork: workItem.organization || workItem.organizationName,
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
    const languageValue = this.stageForm.get("language")?.value;
    const languageLevelValue = this.stageForm.get("languageLevel")?.value;

    ["language", "languageLevel"].forEach(name => {
      this.stageForm.get(name)?.clearValidators();
    });

    if ((languageValue && !languageLevelValue) || (!languageValue && languageLevelValue)) {
      ["language", "languageLevel"].forEach(name => {
        this.stageForm.get(name)?.setValidators([Validators.required]);
      });
    }

    ["language", "languageLevel"].forEach(name => {
      this.stageForm.get(name)?.updateValueAndValidity();
      this.stageForm.get(name)?.markAsTouched();
    });

    const isLanguageValid = this.stageForm.get("language")?.valid;
    const isLanguageLevelValid = this.stageForm.get("languageLevel")?.valid;

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
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue(null);
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });

      this.editLanguageClick.set(false);
    }
  }

  editLanguage(index: number) {
    this.editLanguageClick.set(true);
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

    this.stageForm.patchValue({
      language: languageItem.language,
      languageLevel: languageItem.languageLevel,
    });

    this.editIndex.set(index);
  }

  removeLanguage(i: number) {
    this.languageItems.update(items => items.filter((_, index) => index !== i));

    this.userLanguages.removeAt(i);
  }

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

  applyYearModalError(): void {
    this.isModalErrorYear.set(true);
    this.isModalErrorYearText.set("Год начала обучения должен быть меньше года окончания");
  }

  applySubmitModalError(error: any): void {
    this.isModalErrorYear.set(true);

    if (error.error.language) {
      this.isModalErrorYearText.set(error.error.language);
    }
  }

  applySkipRegistrationModalError(error: any): void {
    this.isModalErrorYear.set(true);
    this.isModalErrorYearText.set(error.error?.message || "Ошибка сохранения");
  }
}
