/** @format */

import { FormControl } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of, Subject } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { ProjectFormAutosaveService } from "./project-form-autosave.service";
import { Project } from "@domain/project/project.model";

describe("ProjectFormAutosaveService", () => {
  let service: ProjectFormAutosaveService;
  let updateFormUseCase: jasmine.SpyObj<UpdateFormUseCase>;

  beforeEach(() => {
    updateFormUseCase = jasmine.createSpyObj<UpdateFormUseCase>("UpdateFormUseCase", ["execute"]);
    updateFormUseCase.execute.and.returnValue(of({ ok: true, value: Project.default() }));

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
    const destroy$ = new Subject<void>();

    service.bindDraftCleanupAutosave(control, "presentationAddress", destroy$);
    control.setValue("");

    expect(updateFormUseCase.execute).toHaveBeenCalledOnceWith({
      id: 42,
      data: {
        presentationAddress: "",
        draft: true,
      },
    });
  });

  it("не отправляет autosave для непустого значения", () => {
    const control = new FormControl("");
    const destroy$ = new Subject<void>();

    service.bindDraftCleanupAutosave(control, "coverImageAddress", destroy$);
    control.setValue("https://example.com/cover.png");

    expect(updateFormUseCase.execute).not.toHaveBeenCalled();
  });

  it("останавливает подписку после destroy", () => {
    const control = new FormControl("https://example.com/cover.png");
    const destroy$ = new Subject<void>();

    service.bindDraftCleanupAutosave(control, "coverImageAddress", destroy$);
    destroy$.next();
    destroy$.complete();
    control.setValue("");

    expect(updateFormUseCase.execute).not.toHaveBeenCalled();
  });
});
