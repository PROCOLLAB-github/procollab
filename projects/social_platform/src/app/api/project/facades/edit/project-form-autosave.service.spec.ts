/** @format */

import { DestroyRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { ProjectFormAutosaveService } from "./project-form-autosave.service";
import { Project } from "@domain/project/project.model";

describe("ProjectFormAutosaveService", () => {
  let service: ProjectFormAutosaveService;
  let updateFormUseCase: any;

  beforeEach(() => {
    updateFormUseCase = { execute: vi.fn() };
    updateFormUseCase.execute.mockReturnValue(of({ ok: true, value: Project.default() }));

    TestBed.configureTestingModule({
      providers: [
        ProjectFormAutosaveService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { projectId: "42" } } },
        },
        {
          provide: UpdateFormUseCase,
          useValue: updateFormUseCase,
        },
      ],
    });

    service = TestBed.inject(ProjectFormAutosaveService);
  });

  it("отправляет draft autosave при очистке presentationAddress", () => {
    const control = new FormControl("https://example.com/presentation");
    const destroyRef = TestBed.inject(DestroyRef);

    service.bindDraftCleanupAutosave(control, "presentationAddress", destroyRef);
    control.setValue("");

    expect(updateFormUseCase.execute).toHaveBeenCalledExactlyOnceWith({
      id: 42,
      data: {
        presentationAddress: "",
        draft: true,
      },
    });
  });

  it("не отправляет autosave для непустого значения", () => {
    const control = new FormControl("");
    const destroyRef = TestBed.inject(DestroyRef);

    service.bindDraftCleanupAutosave(control, "coverImageAddress", destroyRef);
    control.setValue("https://example.com/cover.png");

    expect(updateFormUseCase.execute).not.toHaveBeenCalled();
  });

  it("останавливает подписку после destroy", () => {
    const control = new FormControl("https://example.com/cover.png");
    const destroyRef = TestBed.inject(DestroyRef);

    service.bindDraftCleanupAutosave(control, "coverImageAddress", destroyRef);

    // Уничтожаем TestBed чтобы триггерить DestroyRef
    TestBed.resetTestingModule();

    control.setValue("");

    expect(updateFormUseCase.execute).not.toHaveBeenCalled();
  });
});
