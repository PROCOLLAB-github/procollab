/** @format */

import { provideZonelessChangeDetection, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormArray, FormBuilder, NgControl } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { provideNgxMask } from "ngx-mask";
import { ProjectContactsService } from "@api/project/facades/edit/project-contacts.service";
import { ProjectFormService } from "@api/project/facades/edit/project-form.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProjectsEditUIInfoService } from "@api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ProjectGoalsUIService } from "@api/project/facades/edit/ui/project-goals-ui.service";
import { ProjectGoalService } from "@api/project/facades/edit/project-goals.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectMainStepComponent } from "./project-main-step.component";
import { createProjectForm } from "@api/project/facades/edit/project-form.factory";

describe("ProjectMainStepComponent", () => {
  let fixture: ComponentFixture<ProjectMainStepComponent>;
  let links: FormArray;

  beforeEach(async () => {
    const fb = new FormBuilder();
    const projectForm = createProjectForm(fb);
    const emptyProjectControls = {
      name: projectForm.get("name"),
      region: projectForm.get("region"),
      industry: projectForm.get("industryId"),
      description: projectForm.get("description"),
      actuality: projectForm.get("actuality"),
      implementationDeadline: null,
      problem: projectForm.get("problem"),
      targetAudience: projectForm.get("targetAudience"),
      trl: null,
      partnerProgramId: null,
      presentationAddress: null,
      coverImageAddress: null,
      imageAddress: null,
    };
    links = projectForm.get("links") as FormArray;

    await TestBed.configureTestingModule({
      imports: [ProjectMainStepComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideNgxMask(),
        ProjectContactsService,
        {
          provide: ProjectFormService,
          useValue: {
            getForm: () => projectForm,
            editIndex: signal<number | null>(null),
            ...emptyProjectControls,
          },
        },
        {
          provide: ProjectsEditInfoService,
          useValue: { projectForm, profileId: signal(1), industries$: of([]) },
        },
        {
          provide: ProjectsEditUIInfoService,
          useValue: { leaderId: signal<number | null>(null) },
        },
        {
          provide: ProjectGoalService,
          useValue: {
            getForm: () => fb.group({}),
            goals: fb.array([]),
            goalName: null,
            goalDate: null,
            goalLeader: null,
          },
        },
        {
          provide: ProjectGoalsUIService,
          useValue: {
            hasGoals: signal(false),
            goalItems: signal([]),
            goalLeaderShowModal: signal(false),
            activeGoalIndex: signal<number | null>(null),
            selectedLeaderId: signal<number | null>(null),
          },
        },
        {
          provide: ProjectTeamUIService,
          useValue: { collaborators: signal([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMainStepComponent);
    fixture.detectChanges();
  });

  it("untouched fields are quiet; submit exposes matching borders, warning icons and required messages", async () => {
    const required = ["name", "region", "industry", "problem", "description", "targetAudience"];
    for (const id of required) {
      expect(
        fixture.nativeElement.querySelector(`#${id}`)?.closest("fieldset")?.querySelector(".error"),
      ).toBeNull();
    }
    fixture.componentRef.setInput("projSubmitInitiated", true);
    await fixture.whenStable();
    for (const id of required) {
      const fieldset: HTMLElement = fixture.nativeElement
        .querySelector(`#${id}`)
        .closest("fieldset");
      expect(fieldset.querySelector(".error")?.textContent).toContain("Обязательное поле");
      expect(fieldset.querySelector('[class*="--error"]')).not.toBeNull();
      expect(fieldset.querySelector('[icon="error"]')).not.toBeNull();
    }
    const optional: HTMLElement = fixture.nativeElement
      .querySelector("#actuality")
      .closest("fieldset");
    expect(optional.querySelector(".error")).toBeNull();
    expect(optional.querySelector('[icon="error"]')).toBeNull();
    expect(optional.querySelector(".field--error")).toBeNull();
  });

  it("valid fields do not become required errors after a submit attempt", async () => {
    const form = TestBed.inject(ProjectFormService).getForm();
    form.patchValue({
      name: "Проект",
      region: "Москва",
      industryId: 1,
      problem: "Проблема",
      description: "Информация",
      targetAudience: "Студенты",
    });
    fixture.componentRef.setInput("projSubmitInitiated", true);
    await fixture.whenStable();
    for (const id of [
      "name",
      "region",
      "industry",
      "problem",
      "description",
      "targetAudience",
      "actuality",
    ]) {
      const fieldset: HTMLElement = fixture.nativeElement
        .querySelector(`#${id}`)
        .closest("fieldset");
      expect(fieldset.querySelector(".error")).toBeNull();
      expect(fieldset.querySelector('[icon="error"]')).toBeNull();
      expect(fieldset.querySelector('[class*="--error"]')).toBeNull();
    }
  });

  it("blur exposes a real required error but not an optional blank field", async () => {
    for (const selector of ["app-input#name input", "app-textarea#actuality textarea"]) {
      fixture.nativeElement.querySelector(selector).dispatchEvent(new Event("blur"));
    }
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("app-input#name .project__input-error"),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector("app-textarea#actuality .field__error-icon"),
    ).toBeNull();
  });

  it("keeps validation icons, counters and region controls in separate DOM zones", async () => {
    fixture.componentRef.setInput("projSubmitInitiated", true);
    await fixture.whenStable();

    for (const id of ["name", "problem"]) {
      const field = fixture.nativeElement.querySelector(`app-input#${id} .field`) as HTMLElement;
      expect(field.querySelector(".field__input")).not.toBeNull();
      expect(field.querySelector(".field__right-icon .project__input-error")).not.toBeNull();
      expect(field.querySelector(".field__counter")).not.toBeNull();
    }

    const region = fixture.nativeElement.querySelector("app-region-select#region") as HTMLElement;
    expect(region.querySelector(".region-select__error")).not.toBeNull();
    expect(region.querySelector(".region-select__control--error")).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".project__region-error")).toBeNull();
    expect(fixture.nativeElement.querySelector(".project__grid--main")).not.toBeNull();
  });

  it("renders every new project contact input in the originating UI cycle", async () => {
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLElement;

    addButton.click();
    await fixture.whenStable();
    expect(links.length).toBe(1);
    expect(
      fixture.nativeElement.querySelectorAll('[formarrayname="links"] app-input input'),
    ).toHaveLength(1);
    expect(
      fixture.debugElement
        .query(By.css('[formarrayname="links"] app-input'))
        .injector.get(NgControl).control,
    ).toBe(links.at(0));

    addButton.click();
    await fixture.whenStable();
    expect(links.length).toBe(2);
    expect(
      fixture.nativeElement.querySelectorAll('[formarrayname="links"] app-input input'),
    ).toHaveLength(2);
    const renderedControls = fixture.debugElement.queryAll(
      By.css('[formarrayname="links"] app-input'),
    );
    expect(renderedControls[0].injector.get(NgControl).control).toBe(links.at(0));
    expect(renderedControls[1].injector.get(NgControl).control).toBe(links.at(1));
  });

  it("writes immediately typed contact text into the source FormArray", async () => {
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLElement;

    addButton.click();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      '[formarrayname="links"] app-input input',
    ) as HTMLInputElement;
    input.value = "https://typed-immediately.example";
    input.dispatchEvent(new Event("input"));
    await fixture.whenStable();

    expect(links.getRawValue()).toEqual(["https://typed-immediately.example"]);
  });

  it("keeps the remaining direct control after removing the first contact", async () => {
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLElement;

    addButton.click();
    await fixture.whenStable();
    addButton.click();
    await fixture.whenStable();
    links.at(0).setValue("https://first.example");
    links.at(1).setValue("https://remaining.example");

    const removeButtons = fixture.nativeElement.querySelectorAll(
      ".project__links--remove button",
    ) as NodeListOf<HTMLButtonElement>;
    removeButtons[0].click();
    await fixture.whenStable();

    const remainingInput = fixture.nativeElement.querySelector(
      '[formarrayname="links"] app-input input',
    ) as HTMLInputElement;
    const remainingControl = fixture.debugElement.query(
      By.css('[formarrayname="links"] app-input'),
    );
    expect(links.getRawValue()).toEqual(["https://remaining.example"]);
    expect(remainingInput.value).toBe("https://remaining.example");
    expect(remainingControl.injector.get(NgControl).control).toBe(links.at(0));
  });

  it("renders an input again after deleting the last project contact", async () => {
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLElement;

    addButton.click();
    await fixture.whenStable();

    const removeButton = fixture.nativeElement.querySelector(
      ".project__links--remove button",
    ) as HTMLButtonElement;
    removeButton.click();
    await fixture.whenStable();

    expect(links.length).toBe(0);
    expect(fixture.nativeElement.querySelector('[formarrayname="links"] app-input')).toBeNull();

    addButton.click();
    await fixture.whenStable();

    expect(links.length).toBe(1);
    const input = fixture.nativeElement.querySelector(
      '[formarrayname="links"] app-input input',
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = "https://new.example";
    input.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(links.value).toEqual(["https://new.example"]);
  });

  it("renders loaded links and lets users add and type without another click or manual detection", async () => {
    links.push(new FormBuilder().nonNullable.control("https://existing.example"));
    TestBed.inject(ProjectContactsService).syncLinksItems(links);
    await fixture.whenStable();
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLButtonElement;
    addButton.click();
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll(
      '[formarrayname="links"] input',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe("https://existing.example");
    inputs[1].value = "https://second.example";
    inputs[1].dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(links.value).toEqual(["https://existing.example", "https://second.example"]);
  });
});
