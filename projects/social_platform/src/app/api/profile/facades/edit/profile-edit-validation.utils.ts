/** @format */

import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import dayjs from "dayjs";
import { Skill } from "@domain/skills/skill.model";

const DISPLAY_DATE_FORMAT = "DD.MM.YYYY";
const API_DATE_FORMAT = "YYYY-MM-DD";
const MIN_PROFILE_AGE = 12;
const MAX_PROFILE_AGE = 100;
const MIN_YEAR = 1900;

const parseDisplayDate = (value: string): Date | null => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

export const formatBirthdayForView = (value?: string | null): string => {
  if (!value) return "";

  const apiDate = dayjs(value, API_DATE_FORMAT);
  if (apiDate.isValid()) {
    return apiDate.format(DISPLAY_DATE_FORMAT);
  }

  return value;
};

export const formatBirthdayForApi = (value?: string | null): string | undefined => {
  if (!value) return undefined;

  const displayDate = parseDisplayDate(value);
  if (!displayDate) return undefined;

  return dayjs(displayDate).format(API_DATE_FORMAT);
};

export const profileBirthdayValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as string | null | undefined;
  if (!value) return null;

  const birthdayDate = parseDisplayDate(value);
  const birthday = birthdayDate ? dayjs(birthdayDate) : null;

  if (!birthday || birthday.year() < MIN_YEAR || birthday.isAfter(dayjs(), "day")) {
    return { invalidDateFormat: true };
  }

  const age = dayjs().diff(birthday, "year");
  if (age < MIN_PROFILE_AGE) {
    return { tooYoung: { requiredAge: MIN_PROFILE_AGE } };
  }

  if (age >= MAX_PROFILE_AGE) {
    return { tooOld: { requiredAge: MAX_PROFILE_AGE } };
  }

  return null;
};

export const cyrillicNameValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? "").trim();
  if (!value) return null;

  return /^[А-Яа-яЁё-]+$/.test(value) ? null : { invalidLanguage: true };
};

export const skillsCountValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const skills = (control.value ?? []) as Skill[];

  if (!Array.isArray(skills) || skills.length < 1) {
    return { minSkills: { requiredLength: 1 } };
  }

  if (skills.length > 20) {
    return { maxSkills: { requiredLength: 20 } };
  }

  return null;
};

export const userLanguagesValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const formArray = control as FormArray<FormGroup>;
  const languages = formArray.controls
    .map(group => group.get("language")?.value)
    .filter(Boolean) as string[];

  if (languages.length > 4) {
    return { maxLanguages: { requiredLength: 4 } };
  }

  if (new Set(languages).size !== languages.length) {
    return { duplicateLanguages: true };
  }

  return null;
};

export const yearBoundsValidator = (
  entryYearControlName: string,
  completionYearControlName: string,
): ValidatorFn => {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const currentYear = new Date().getFullYear() + 1;
    const entryYear = formGroup.get(entryYearControlName)?.value;
    const completionYear = formGroup.get(completionYearControlName)?.value;
    const years = [entryYear, completionYear].filter(Boolean) as number[];

    return years.some(year => year < MIN_YEAR || year > currentYear)
      ? { yearBoundsError: { min: MIN_YEAR, max: currentYear } }
      : null;
  };
};
