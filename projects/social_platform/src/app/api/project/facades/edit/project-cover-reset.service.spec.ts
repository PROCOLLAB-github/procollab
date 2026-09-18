/** @format */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Subject, of } from "rxjs";
import { Project } from "@domain/project/project.model";
import { ProjectCoverReset } from "@domain/project/project-cover.model";
import { Result, ok, fail } from "@domain/shared/result.type";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ProjectFormService } from "./project-form.service";
import { ProjectCoverResetService } from "./project-cover-reset.service";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import {
  ResetProjectCoverUseCase,
  ResetProjectCoverError,
} from "../../use-cases/reset-project-cover.use-case";

@Component({ template: "", providers: [ProjectCoverResetService] })
class EditorHost {}

describe("ProjectCoverResetService", () => {
  let form: ProjectFormService;
  let service: ProjectCoverResetService;
  let response: Subject<Result<ProjectCoverReset, ResetProjectCoverError>>;
  let execute: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;
  let fixture: ReturnType<typeof TestBed.createComponent<EditorHost>>;
  const defaultCover: ProjectCoverReset = {
    coverImageAddress: "https://files.test/default.png",
    isDefaultCover: true,
  };

  function project(id = 31, isDefaultCover: boolean | undefined = false): Project {
    return {
      ...Project.default(),
      id,
      isDefaultCover,
      coverImageAddress: `https://files.test/${id}.png`,
      region: "Москва",
      industry: 1,
      name: "Проект",
      description: "Описание",
      problem: "Проблема",
      targetAudience: "Студенты",
      trl: "4",
      implementationDeadline: "2027-01-01",
      achievements: [],
      links: [],
      partnerProgram: {
        id: 73,
        programId: 21,
        programLinkId: 73,
        isSubmitted: false,
        canSubmit: true,
        programFields: [],
        programFieldValues: [],
      },
    };
  }

  beforeEach(() => {
    response = new Subject();
    execute = vi.fn(() => response);
    update = vi.fn(() => of(ok(Project.default())));
    error = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: ResetProjectCoverUseCase, useValue: { execute } },
        { provide: UpdateFormUseCase, useValue: { execute: update } },
        { provide: SnackbarService, useValue: { error } },
      ],
    });
    form = TestBed.inject(ProjectFormService);
    form.initializeProjectData(project());
    fixture = TestBed.createComponent(EditorHost);
    service = fixture.debugElement.injector.get(ProjectCoverResetService);
  });

  it("использует Project.id, игнорирует повторный клик и не очищает control перед ответом", () => {
    service.reset();
    service.reset();
    expect(execute).toHaveBeenCalledExactlyOnceWith(31);
    expect(form.coverImageAddress?.value).toContain("/31.png");
    expect(service.pending()).toBe(true);
    response.next(ok(defaultCover));
    response.complete();
    expect(form.coverImageAddress?.value).toBe(defaultCover.coverImageAddress);
    expect(form.isDefaultCover()).toBe(true);
    expect(form.coverImageAddress?.valid).toBe(true);
    expect(form.validateForm()).toBe(true);
    expect(form.getFormValue().coverImageAddress).toBe(defaultCover.coverImageAddress);
    expect(update).not.toHaveBeenCalled();
    expect(service.pending()).toBe(false);
  });

  it.each([true, undefined])("стандартность %s не разрешает сброс", flag => {
    const data = project();
    data.isDefaultCover = flag;
    form.initializeProjectData(data);
    service.reset();
    expect(execute).not.toHaveBeenCalled();
  });

  it.each(["unavailable", "forbidden", "failed"] as const)(
    "ошибка %s сохраняет прежний URL и показывает сообщение",
    kind => {
      service.reset();
      response.next(fail(kind));
      response.complete();
      expect(form.coverImageAddress?.value).toContain("/31.png");
      expect(form.isDefaultCover()).toBe(false);
      expect(error).toHaveBeenCalledOnce();
      expect(service.pending()).toBe(false);
    },
  );

  it.each([31, 32])("поздний ответ не изменяет повторно инициализированный контекст %s", id => {
    service.reset();
    form.initializeProjectData({ ...project(id), coverImageAddress: "https://files.test/new.png" });
    expect(response.observed).toBe(false);
    response.next(ok(defaultCover));
    expect(form.coverImageAddress?.value).toBe("https://files.test/new.png");
    expect(form.isDefaultCover()).toBe(false);
    expect(service.pending()).toBe(false);
  });

  it("уничтожение редактора отменяет подписку и не меняет форму", () => {
    service.reset();
    fixture.destroy();
    response.next(ok(defaultCover));
    expect(response.observed).toBe(false);
    expect(form.coverImageAddress?.value).toContain("/31.png");
  });

  it("параллельная замена URL защищена от позднего результата", () => {
    service.reset();
    form.coverImageAddress?.setValue("https://files.test/new.png");
    response.next(ok(defaultCover));
    response.complete();
    expect(form.coverImageAddress?.value).toBe("https://files.test/new.png");
    expect(form.isDefaultCover()).toBe(false);
  });

  it("сброс форм отменяет запрос, presentation cleanup сохраняет прежнюю семантику", () => {
    form.presentationAddress?.setValue("");
    expect(update).toHaveBeenCalledExactlyOnceWith({
      id: 31,
      data: { presentationAddress: "", draft: true },
    });
    service.reset();
    form.resetForms();
    response.next(ok(defaultCover));
    expect(form.isDefaultCover()).toBeNull();
    expect(form.currentProjectId()).toBeNull();
    expect(response.observed).toBe(false);
  });
});
