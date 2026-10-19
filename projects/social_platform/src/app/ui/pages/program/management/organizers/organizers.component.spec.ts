/** @format */
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { ProgramOrganizersUseCase } from "@api/program/use-cases/program-organizers.use-case";
import { ProgramOrganizers } from "@domain/program/program-organizers.model";
import { ManagementOrganizersComponent } from "./organizers.component";

const snapshot: ProgramOrganizers = {
  revision: "v1",
  organizerCount: 2,
  activeOrganizerCount: 2,
  invitationCount: 1,
  organizers: [
    {
      id: "member:1",
      userId: 1,
      name: "Фёдор Евсеев",
      email: "fedor@example.com",
      avatar: null,
      status: "joined",
      active: true,
      isSelf: true,
      canRemove: true,
    },
    {
      id: "member:2",
      userId: 2,
      name: "Анна Миронова",
      email: "anna@example.com",
      avatar: null,
      status: "joined",
      active: true,
      isSelf: false,
      canRemove: true,
    },
    {
      id: "invite:3",
      invitationId: 3,
      name: null,
      email: "olga@example.com",
      avatar: null,
      status: "pending",
      deliveryStatus: "sent",
      isSelf: false,
      canRemove: false,
    },
  ],
};
function setup() {
  const api = {
    list: vi.fn(() => of(structuredClone(snapshot))),
    invite: vi.fn(() => of(structuredClone(snapshot))),
    invitationAction: vi.fn(() => of(structuredClone(snapshot))),
    remove: vi.fn(() => of(structuredClone(snapshot))),
  };
  TestBed.configureTestingModule({
    imports: [ManagementOrganizersComponent],
    providers: [{ provide: ProgramOrganizersUseCase, useValue: api }],
  });
  const fixture = TestBed.createComponent(ManagementOrganizersComponent);
  fixture.componentRef.setInput("programId", 42);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api };
}
describe("Организаторы программы", () => {
  it("переключает выбор повторным нажатием и не запрашивает список при выборе", () => {
    const { fixture, component, api } = setup();
    const calls = api.list.mock.calls.length;
    const row = fixture.nativeElement.querySelector(
      'tr[data-organizer-id="member:2"]',
    ) as HTMLElement;
    row.click();
    fixture.detectChanges();
    expect(component.selected()?.userId).toBe(2);
    expect(fixture.nativeElement.querySelector(".organizers__floating")).not.toBeNull();
    row.click();
    fixture.detectChanges();
    expect(component.selected()).toBeNull();
    expect(api.list).toHaveBeenCalledTimes(calls);
  });
  it("оставляет ввод и фокус поиска при обновлении данных", () => {
    const { fixture, component } = setup();
    const search = fixture.nativeElement.querySelector("input[type=search]") as HTMLInputElement;
    search.focus();
    search.value = "Ан";
    search.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    component.load();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("input[type=search]")).toBe(search);
    expect(search.value).toBe("Ан");
    expect(document.activeElement).toBe(search);
    expect(component.visible().map(r => r.userId)).toEqual([2]);
  });
  it("не отправляет снятие доступа для последнего организатора", () => {
    const { component, api } = setup();
    const only = {
      ...snapshot,
      organizerCount: 1,
      activeOrganizerCount: 1,
      organizers: [{ ...snapshot.organizers[0], canRemove: false }],
    };
    component.snapshot.set(only);
    component.select(only.organizers[0]);
    component.remove();
    expect(api.remove).not.toHaveBeenCalled();
  });
  it("передаёт актуальную ревизию и очищает приватный список после выхода", () => {
    const { component, api } = setup();
    api.remove.mockReturnValue(of({ accessRemoved: true, programId: 42 }) as never);
    const removed = vi.fn();
    component.accessRemoved.subscribe(removed);
    component.select(snapshot.organizers[0]);
    component.remove();
    expect(api.remove).toHaveBeenCalledWith(42, 1, "v1");
    expect(removed).toHaveBeenCalledOnce();
    expect(component.snapshot()).toBeNull();
    expect(component.selected()).toBeNull();
    expect(component.busy()).toBe(false);
  });
  it("сохраняет email и модалку при конфликте и обновляет ревизию", () => {
    const { component, api } = setup();
    component.open("invite");
    component.email.setValue("new@example.com");
    api.invite.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { detail: "Состав изменился" } }),
      ),
    );
    api.list.mockReturnValue(of({ ...snapshot, revision: "v2" }));
    component.invite();
    expect(component.email.value).toBe("new@example.com");
    expect(component.modal()).toBe("invite");
    expect(component.dialogError()).toBe("Состав изменился");
    expect(component.snapshot()?.revision).toBe("v2");
  });
  it("очищает приватные данные и сигнализирует об отзыве доступа при 403", () => {
    const { component, api } = setup();
    const lost = vi.fn();
    component.accessRemoved.subscribe(lost);
    api.list.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.load();
    expect(component.snapshot()).toBeNull();
    expect(lost).toHaveBeenCalledOnce();
  });
  it("обновляет доставку, не сбрасывая поиск, и отменяет фоновые запросы при уходе", async () => {
    vi.useFakeTimers();
    try {
      const { fixture, component, api } = setup();
      const queued = structuredClone(snapshot);
      queued.organizers[2].deliveryStatus = "queued";
      api.list.mockReturnValue(of(queued));
      component.load();
      component.search.setValue("olga");
      api.list.mockReturnValue(of(snapshot));
      await vi.advanceTimersByTimeAsync(5000);
      fixture.detectChanges();
      expect(component.search.value).toBe("olga");
      expect(component.visible()[0].deliveryStatus).toBe("sent");
      fixture.destroy();
      const calls = api.list.mock.calls.length;
      await vi.advanceTimersByTimeAsync(30000);
      expect(api.list).toHaveBeenCalledTimes(calls);
    } finally {
      vi.useRealTimers();
    }
  });
});
