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
import { ResetProjectCoverUseCase } from "@api/project/use-cases/reset-project-cover.use-case";
import { UploadFileComponent } from "@ui/primitives/upload-file/upload-file.component";
import { FileService } from "@core/lib/services/file/file.service";
import { initial } from "@domain/shared/async-state";
import { Subject } from "rxjs";
import { ProjectCoverResetService } from "@api/project/facades/edit/project-cover-reset.service";

describe("ProjectMainStepComponent", () => {
  let fixture: ComponentFixture<ProjectMainStepComponent>;
  let links: FormArray;
  const resetCover = { execute: vi.fn() };
  const files = { deleteFile: vi.fn(), uploadFile: vi.fn() };

  beforeEach(async () => {
    const fb = new FormBuilder();
    const projectForm = createProjectForm(fb);
    resetCover.execute.mockReset().mockReturnValue(
      of({
        ok: true,
        value: { coverImageAddress: "https://files.test/default.png", isDefaultCover: true },
      }),
    );
    files.deleteFile.mockReset().mockReturnValue(of(undefined));
    files.uploadFile.mockReset().mockReturnValue(of({ url: "https://files.test/custom.png" }));
    projectForm.get("coverImageAddress")?.setValue("https://files.test/default.png");
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
      coverImageAddress: projectForm.get("coverImageAddress"),
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
        ProjectCoverResetService,
        { provide: ResetProjectCoverUseCase, useValue: resetCover },
        { provide: FileService, useValue: files },
        {
          provide: ProjectFormService,
          useValue: {
            getForm: () => projectForm,
            editIndex: signal<number | null>(null),
            isDefaultCover: signal<boolean | null>(true),
            currentProjectId: signal(31),
            contextChanged$: new Subject<void>(),
            ...emptyProjectControls,
          },
        },
        {
          provide: ProjectsEditInfoService,
          useValue: {
            projectForm,
            profileId: signal(1),
            industries$: of([]),
            projFormIsSubmitting$: signal(initial()),
          },
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

  it("стандартная обложка предлагает загрузку и не выдаёт системный URL за загруженный файл", () => {
    const upload = fixture.debugElement.query(By.css('[formControlName="coverImageAddress"]'))
      .componentInstance as UploadFileComponent;
    expect(
      fixture.nativeElement.querySelector('[formcontrolname="coverImageAddress"] .file__basket'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector(".project__cover-reset")).toBeNull();
    const cover = fixture.nativeElement.querySelector('[formcontrolname="coverImageAddress"]');
    expect(cover.textContent).toContain("Стандартная обложка");
    expect(cover.textContent).not.toContain("Файл успешно загружен");
    expect(cover.querySelector(".file__replace").textContent.trim()).toBe("Загрузить файл");
    expect(cover.querySelector('[icon="file-success"]')).toBeNull();
    expect(upload.value).toBe("https://files.test/default.png");
    upload.onRemove();
    expect(files.deleteFile).not.toHaveBeenCalled();
    expect(resetCover.execute).not.toHaveBeenCalled();
  });

  it("пользовательская обложка предлагает только замену с клавиатуры, без кнопки сброса", async () => {
    const form = TestBed.inject(ProjectFormService);
    form.isDefaultCover.set(false);
    form.coverImageAddress?.setValue("https://files.test/custom.png");
    await fixture.whenStable();
    const cover = fixture.nativeElement.querySelector('[formcontrolname="coverImageAddress"]');
    const replace = cover.querySelector(".file__replace") as HTMLButtonElement;
    const fileInput = cover.querySelector('input[type="file"]') as HTMLInputElement;
    const chooseFile = vi.spyOn(fileInput, "click");
    expect(replace.textContent?.trim()).toBe("Заменить файл");
    expect(cover.textContent).not.toContain("Стандартная обложка");
    expect(cover.textContent).toContain("Файл успешно загружен");
    replace.focus();
    expect(document.activeElement).toBe(replace);
    replace.click();
    expect(chooseFile).toHaveBeenCalledOnce();
    expect(resetCover.execute).not.toHaveBeenCalled();
    expect(form.coverImageAddress?.value).toBe("https://files.test/custom.png");
    expect(fixture.nativeElement.querySelector(".project__cover-reset")).toBeNull();
    const upload = fixture.debugElement.query(By.css('[formControlName="coverImageAddress"]'))
      .componentInstance as UploadFileComponent;
    expect(upload.value).toBe("https://files.test/custom.png");
    expect(files.deleteFile).not.toHaveBeenCalled();
  });

  it("замена стандартной и пользовательской обложки загрузкой не вызывает DELETE", async () => {
    for (const url of ["https://files.test/custom-a.png", "https://files.test/custom-b.png"]) {
      files.uploadFile.mockReturnValue(of({ url }));
      const upload = fixture.debugElement.query(By.css('[formControlName="coverImageAddress"]'))
        .componentInstance as UploadFileComponent;
      upload.onUpdate({
        currentTarget: { files: [new File(["png"], "cover.png", { type: "image/png" })] },
      } as unknown as Event);
      await fixture.whenStable();
      expect(TestBed.inject(ProjectFormService).coverImageAddress?.value).toBe(url);
      expect(TestBed.inject(ProjectFormService).isDefaultCover()).toBe(false);
      expect(fixture.nativeElement.querySelector(".project__cover-reset")).toBeNull();
      const cover = fixture.nativeElement.querySelector('[formcontrolname="coverImageAddress"]');
      expect(cover.querySelector(".file__replace").textContent.trim()).toBe("Заменить файл");
      expect(cover.textContent).not.toContain("Стандартная обложка");
    }
    expect(files.deleteFile).not.toHaveBeenCalled();
  });

  it("пустая обложка показывает zero state, не записывая фиктивный URL в обязательный control", async () => {
    const form = TestBed.inject(ProjectFormService);
    form.isDefaultCover.set(null);
    form.coverImageAddress?.setValue("");
    await fixture.whenStable();
    const cover = fixture.nativeElement.querySelector('[formcontrolname="coverImageAddress"]');
    expect(cover.textContent).toContain("Стандартная обложка");
    expect(cover.querySelector(".file__replace").textContent.trim()).toBe("Загрузить файл");
    expect(cover.textContent).not.toContain("Файл успешно загружен");
    expect(form.coverImageAddress?.value).toBe("");
    expect(form.coverImageAddress?.hasError("required")).toBe(true);
    expect(files.uploadFile).not.toHaveBeenCalled();
    expect(resetCover.execute).not.toHaveBeenCalled();
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
      const input = fixture.nativeElement.querySelector(`app-input#${id}`) as HTMLElement;
      const field = input.querySelector(".field") as HTMLElement;
      expect(input.classList).toContain("project__validated-input--error");
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
