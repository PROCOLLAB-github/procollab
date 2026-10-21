/** @format */
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  ManagementProjectActionPreview,
  ManagementProjectActionResult,
} from "@domain/program/program-management.model";
import {
  ManagementProjectActionsComponent,
  ProjectActionRequest,
} from "./project-actions.component";

describe("Действия с проектами программы", () => {
  const ready: ManagementProjectActionPreview = {
    items: [{ id: 7, name: "Проект", errors: [] }],
    readyCount: 1,
    alreadySubmittedCount: 0,
    scoreCount: 2,
    removedAssignmentsCount: 1,
    canApply: true,
    previewToken: "proof",
  };
  const request: ProjectActionRequest = { programId: 4, ids: [7], action: "submit" };
  const setup = (action = request) => {
    const api = {
      previewProjectAction: vi.fn(() => of(ready)),
      applyProjectAction: vi.fn(() => of({ changedCount: 1, alreadySubmittedCount: 0 })),
    };
    TestBed.configureTestingModule({
      imports: [ManagementProjectActionsComponent],
      providers: [{ provide: ProgramManagementUseCase, useValue: api }],
    });
    const fixture = TestBed.createComponent(ManagementProjectActionsComponent);
    fixture.componentRef.setInput("request", action);
    fixture.componentRef.setInput("caseOptions", ["Банк", "Город"]);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, api };
  };

  it("сначала проверяет весь набор, отправляет подтвержденные ID и token только по нажатию", () => {
    const { component, api } = setup({ ...request, ids: [7, 8] });
    expect(api.previewProjectAction).toHaveBeenCalledWith(4, { action: "submit", ids: [7, 8] });
    expect(api.applyProjectAction).not.toHaveBeenCalled();
    const done = vi.fn();
    component.completed.subscribe(done);
    component.confirm();
    expect(api.applyProjectAction).toHaveBeenCalledWith(4, {
      action: "submit",
      ids: [7, 8],
      previewToken: "proof",
    });
    expect(done).toHaveBeenCalledWith({
      programId: 4,
      action: "submit",
      changedCount: 1,
      alreadySubmittedCount: 0,
    });
  });

  it("выбор кейса проверяется заново, старый ответ не заменяет текущий", () => {
    const { component, api } = setup({ ...request, action: "change_case" });
    expect(api.previewProjectAction).not.toHaveBeenCalled();
    const old = new Subject<ManagementProjectActionPreview>(),
      current = new Subject<ManagementProjectActionPreview>();
    api.previewProjectAction.mockReturnValueOnce(old).mockReturnValueOnce(current);
    component.caseControl.setValue("Банк");
    component.caseControl.setValue("Город");
    old.next({ ...ready, previewToken: "old" });
    expect(component.preview()).toBeNull();
    current.next({ ...ready, previewToken: "new" });
    current.complete();
    component.confirm();
    expect(api.applyProjectAction).toHaveBeenCalledWith(4, {
      action: "change_case",
      ids: [7],
      caseName: "Город",
      previewToken: "new",
    });
  });

  it("блокеры и отмена не приводят к сдаче", () => {
    const { component, api } = setup();
    api.previewProjectAction.mockReturnValue(
      of({
        ...ready,
        canApply: false,
        previewToken: null,
        items: [{ id: 7, name: "Проект", errors: ["Заполните презентацию"] }],
      }),
    );
    component.loadPreview();
    component.confirm();
    expect(api.applyProjectAction).not.toHaveBeenCalled();
    expect(component.blocked()[0].errors).toEqual(["Заполните презентацию"]);
    const close = vi.fn();
    component.closed.subscribe(close);
    component.close();
    expect(close).toHaveBeenCalledOnce();
  });

  it("не отправляет повторный apply и не закрывает окно во время сохранения", () => {
    const { component, api } = setup({ ...request, action: "detach" });
    const pending = new Subject<ManagementProjectActionResult>();
    api.applyProjectAction.mockReturnValue(pending);
    const close = vi.fn(),
      busy = vi.fn();
    component.closed.subscribe(close);
    component.busyChange.subscribe(busy);
    component.confirm();
    component.confirm();
    component.close();
    expect(api.applyProjectAction).toHaveBeenCalledOnce();
    expect(close).not.toHaveBeenCalled();
    expect(busy).toHaveBeenCalledWith(true);
    pending.next({ changedCount: 1, alreadySubmittedCount: 0 });
    pending.complete();
    expect(component.applying()).toBe(false);
    expect(busy).toHaveBeenLastCalledWith(false);
  });

  it("после409 требует новую проверку и явное подтверждение", () => {
    const { component, api } = setup();
    api.applyProjectAction.mockReturnValueOnce(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { detail: "Данные изменились" } }),
      ),
    );
    component.confirm();
    expect(component.preview()).toBeNull();
    expect(component.error()).toBe("Данные изменились");
    component.confirm();
    expect(api.applyProjectAction).toHaveBeenCalledOnce();
    component.loadPreview();
    expect(api.applyProjectAction).toHaveBeenCalledOnce();
    component.confirm();
    expect(api.applyProjectAction).toHaveBeenCalledTimes(2);
  });

  it("при смене контекста сбрасывает token и незавершенную проверку", () => {
    const { component, fixture, api } = setup();
    const pending = new Subject<ManagementProjectActionPreview>();
    api.previewProjectAction.mockReturnValueOnce(pending);
    component.loadPreview();
    fixture.componentRef.setInput("request", {
      ...request,
      programId: 9,
      ids: [42],
      action: "change_case",
    });
    fixture.detectChanges();
    pending.next(ready);
    expect(component.preview()).toBeNull();
    component.confirm();
    expect(api.applyProjectAction).not.toHaveBeenCalled();
  });
});
