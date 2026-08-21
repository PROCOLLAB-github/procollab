/** @format */

import { FormArray, FormControl, FormGroup } from "@angular/forms";
import dayjs from "dayjs";
import {
  cyrillicNameValidator,
  formatBirthdayForApi,
  formatBirthdayForView,
  profileBirthdayValidator,
  userLanguagesValidator,
  userPhoneNumberValidator,
  yearBoundsValidator,
} from "./profile-edit-validation.utils";

describe("profile edit validation utils", () => {
  it("should convert birthday between API and display formats", () => {
    expect(formatBirthdayForView("1990-03-25")).toBe("25.03.1990");
    expect(formatBirthdayForApi("25.03.1990")).toBe("1990-03-25");
  });

  it("should accept real manually typed birthday", () => {
    const control = new FormControl(dayjs().subtract(20, "year").format("DD.MM.YYYY"));

    expect(profileBirthdayValidator(control)).toBeNull();
  });

  it("should reject invalid manually typed birthday", () => {
    const control = new FormControl("31.02.2000");

    expect(profileBirthdayValidator(control)).toEqual({ invalidDateFormat: true });
  });

  it("should reject age below 12", () => {
    const control = new FormControl(dayjs().subtract(11, "year").format("DD.MM.YYYY"));

    expect(profileBirthdayValidator(control)).toEqual({ tooYoung: { requiredAge: 12 } });
  });

  it("should reject age greater than or equal to 100", () => {
    const control = new FormControl(dayjs().subtract(100, "year").format("DD.MM.YYYY"));

    expect(profileBirthdayValidator(control)).toEqual({ tooOld: { requiredAge: 100 } });
  });

  it("should validate experience years according to backend range", () => {
    const currentYear = new Date().getFullYear();
    const validator = yearBoundsValidator("entryYear", "completionYear");
    const group = new FormGroup({
      entryYear: new FormControl(1970),
      completionYear: new FormControl(currentYear),
    });

    expect(validator(group)).toEqual({ yearBoundsError: { min: 1971, max: currentYear } });

    group.patchValue({ entryYear: 1971, completionYear: currentYear });

    expect(validator(group)).toBeNull();

    group.patchValue({ entryYear: currentYear + 1 });

    expect(validator(group)).toEqual({ yearBoundsError: { min: 1971, max: currentYear } });
  });

  it("should reject hyphenated names according to backend user_name_validator", () => {
    expect(cyrillicNameValidator(new FormControl("Анна-Мария"))).toEqual({
      invalidLanguage: true,
    });
    expect(cyrillicNameValidator(new FormControl("Анна"))).toBeNull();
  });

  it("should allow backend-supported formatted phone and reject invalid phone", () => {
    expect(userPhoneNumberValidator(new FormControl("+7 (999) 123-45-67"))).toBeNull();
    expect(userPhoneNumberValidator(new FormControl("wrong-phone"))).toEqual({ pattern: true });
  });

  it("should reject more than 4 languages and duplicates", () => {
    const languages = new FormArray([
      new FormGroup({ language: new FormControl("en") }),
      new FormGroup({ language: new FormControl("de") }),
      new FormGroup({ language: new FormControl("fr") }),
      new FormGroup({ language: new FormControl("es") }),
      new FormGroup({ language: new FormControl("en") }),
    ]);

    expect(userLanguagesValidator(languages)).toEqual({
      maxLanguages: { requiredLength: 4 },
    });

    languages.removeAt(4);
    languages.at(3).get("language")?.setValue("de");

    expect(userLanguagesValidator(languages)).toEqual({ duplicateLanguages: true });
  });
});
