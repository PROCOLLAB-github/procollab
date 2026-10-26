/** @format */

import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup } from "@angular/forms";
import { SolutionField } from "@domain/solution/solution-contract.model";
import { SolutionFieldsComponent } from "./solution-fields.component";

describe("Readonly solution materials", () => {
  it("opens safe URL answers while preserving zero and false as actual answers", () => {
    const validation = {
      minLength: null,
      maxLength: null,
      minimum: null,
      maximum: null,
      allowedExtensions: [],
      maxFileSizeBytes: null,
    };
    const fields: SolutionField[] = [
      {
        id: 1,
        type: "url",
        purpose: "repository",
        label: "Репозиторий",
        helpText: "",
        required: false,
        position: 0,
        options: [],
        validation,
      },
      {
        id: 2,
        type: "number",
        purpose: "other",
        label: "Число",
        helpText: "",
        required: false,
        position: 1,
        options: [],
        validation,
      },
      {
        id: 3,
        type: "checkbox",
        purpose: "other",
        label: "Прототип",
        helpText: "",
        required: false,
        position: 2,
        options: [],
        validation,
      },
    ];
    const group = new FormGroup({
      "1": new FormControl("https://example.test/repository"),
      "2": new FormControl(0),
      "3": new FormControl(false),
    });
    const fixture = TestBed.createComponent(SolutionFieldsComponent);
    fixture.componentRef.setInput("fields", fields);
    fixture.componentRef.setInput("group", group);
    fixture.componentRef.setInput("readonly", true);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector("a") as HTMLAnchorElement;
    expect(link.href).toBe("https://example.test/repository");
    expect(link.rel).toContain("noopener");
    expect(fixture.nativeElement.textContent).toContain("Нет");
    expect(fixture.nativeElement.textContent).toContain("0");
    fixture.componentRef.setInput(
      "group",
      new FormGroup({
        "1": new FormControl("javascript:alert(1)"),
        "2": new FormControl(0),
        "3": new FormControl(false),
      }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("a")).toBeNull();
  });
});
