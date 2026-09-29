/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CollaboratorCardComponent } from "./collaborator-card.component";
import { of, Subject } from "rxjs";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";

describe("CollaboratorCardComponent", () => {
  let component: CollaboratorCardComponent;
  let fixture: ComponentFixture<CollaboratorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorCardComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { params: { projectId: "5" } } } },
        {
          provide: RemoveProjectCollaboratorUseCase,
          useValue: { execute: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaboratorCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("collaborator", {
      userId: 1,
      firstName: "Test",
      lastName: "User",
      role: "Developer",
      skills: [],
      avatar: "",
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("сохраняет подтверждение и не удаляет участника при ошибке, блокирует повтор", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const execute = vi.mocked(TestBed.inject(RemoveProjectCollaboratorUseCase).execute);
    const removed = vi.fn();
    component.collaboratorRemoved.subscribe(removed);
    component.onDeleteCollaborator(1);
    expect(execute).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    const request = new Subject<any>();
    execute.mockReturnValue(request);
    component.onDeleteCollaborator(1);
    component.onDeleteCollaborator(1);
    expect(execute).toHaveBeenCalledExactlyOnceWith(5, 1, undefined);
    request.next({ ok: false, error: { kind: "remove_project_collaborator_error" } });
    request.complete();
    fixture.detectChanges();
    expect(removed).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Не удалось",
    );
    expect(component.removing()).toBe(false);
    execute.mockReturnValue(of({ ok: true, value: 1 }));
    component.onDeleteCollaborator(1);
    expect(removed).toHaveBeenCalledExactlyOnceWith(1);
    confirm.mockRestore();
  });
  it("не отправляет удаление замороженной команды или лидера", () => {
    const execute = vi.mocked(TestBed.inject(RemoveProjectCollaboratorUseCase).execute);
    fixture.componentRef.setInput("frozen", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").disabled).toBe(true);
    component.onDeleteCollaborator(1);
    fixture.componentRef.setInput("frozen", false);
    fixture.componentRef.setInput("isLeader", true);
    component.onDeleteCollaborator(1);
    expect(execute).not.toHaveBeenCalled();
  });
});
