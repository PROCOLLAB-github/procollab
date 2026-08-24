/** @format */

import { FormArray, FormControl, FormGroup } from "@angular/forms";
import dayjs from "dayjs";
import {
  formatBirthdayForApi,
  formatBirthdayForView,
  profileBirthdayValidator,
  userLanguagesValidator,
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
