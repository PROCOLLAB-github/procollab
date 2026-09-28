/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InviteCardComponent } from "./invite-card.component";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";

describe("InviteCardComponent", () => {
  let component: InviteCardComponent;
  let fixture: ComponentFixture<InviteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteCardComponent],
      providers: [
        provideNgxMask(),
        {
          provide: AuthRepositoryPort,
          useValue: {
            fetchProfile: () => of({}),
            fetchUserRoles: () => of([]),
            fetchChangeableRoles: () => of([]),
            fetchLeaderProjects: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("invite", {
      id: 1,
      user: { id: 1, firstName: "Test", lastName: "User", personal: { avatar: "" } },
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("показывает настоящую дату отправки и не выдумывает отсутствующую", () => {
    fixture.componentRef.setInput("invite", {
      id: 1,
      user: { firstName: "Анна", lastName: "Смирнова", personal: { avatar: "" } },
      datetimeCreated: "2024-03-12T12:00:00Z",
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Отправлено 12 мар.");
    fixture.componentRef.setInput("invite", { ...component.invite(), datetimeCreated: "invalid" });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Ожидает ответа участника");
  });
  it("редактирование нормализует роль, сохраняет specialization и не отправляет пустую роль", () => {
    fixture.componentRef.setInput("invite", {
      ...component.invite(),
      role: "Аналитик",
      specialization: "legacy-value",
    });
    const edit = vi.fn();
    component.edit.subscribe(edit);
    component.openEdit({ currentTarget: document.createElement("button") } as any);
    expect(component.role.value).toBe("Аналитик");
    component.role.setValue("   ");
    component.onEdit();
    expect(edit).not.toHaveBeenCalled();
    component.role.setValue("  Продуктовый   аналитик  ");
    component.onEdit();
    expect(edit).toHaveBeenCalledExactlyOnceWith({
      inviteId: 1,
      role: "Продуктовый аналитик",
      specialization: "legacy-value",
    });
    expect(component.isEditInviteModal()).toBe(false);
  });
  it("отмена отзыва не удаляет, подтверждение передаёт ID приглашения", () => {
    const remove = vi.fn();
    component.remove.subscribe(remove);
    component.openRemove({ currentTarget: document.createElement("button") } as any);
    expect(remove).not.toHaveBeenCalled();
    component.isRemoveInviteModal.set(false);
    expect(remove).not.toHaveBeenCalled();
    component.onRemove();
    expect(remove).toHaveBeenCalledExactlyOnceWith(1);
  });
});
