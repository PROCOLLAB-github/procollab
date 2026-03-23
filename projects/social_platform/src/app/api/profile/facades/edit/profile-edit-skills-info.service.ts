/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ProfileEditInfoService } from "./profile-edit-info.service";
import { ProfileFormService } from "./profile-form.service";

@Injectable()
export class ProfileEditSkillsInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);
  private readonly profileFormService = inject(ProfileFormService);

  private readonly destroy$ = new Subject<void>();

  protected readonly editIndex = this.profileEditInfoService.editIndex;

  private readonly profileForm = this.profileFormService.getForm();

  readonly editLanguageClick = signal<boolean>(false);
  readonly showLanguageFields = signal<boolean>(false);

  readonly languageItems = signal<any[]>([]);
  private readonly userLanguages = this.profileFormService.userLanguages;

  private readonly languageList = this.profileFormService.languageList;
  private readonly languageLevelList = this.profileFormService.languageLevelList;

  readonly selectedLanguageId = signal<number | undefined>(undefined);
  readonly selectedLanguageLevelId = signal<number | undefined>(undefined);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addLanguage() {
    if (!this.showLanguageFields()) {
      this.showLanguageFields.set(true);
      return;
    }

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
      this.showLanguageFields.set(false);
    }
    this.editLanguageClick.set(false);
  }

  editLanguage(index: number) {
    this.editLanguageClick.set(true);
    this.showLanguageFields.set(true);
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
}
