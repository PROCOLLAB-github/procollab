/** @format */

import { provideRouter } from "@angular/router";
import { TestBed } from "@angular/core/testing";
import { User } from "@domain/auth/user.model";
import { ProfileControlPanelComponent } from "./profile-control-panel.component";

describe("ProfileControlPanelComponent: колокольчик", () => {
  function render(hasNotifications = false) {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(ProfileControlPanelComponent);
    fixture.componentRef.setInput("user", { id: 42, personal: {} } as User);
    fixture.componentRef.setInput("invites", []);
    fixture.componentRef.setInput("hasNotifications", hasNotifications);
    fixture.detectChanges();
    return fixture;
  }

  it("оставляет индикатор уведомлений внутри локально центрируемого контейнера", () => {
    const element = render(true).nativeElement as HTMLElement;
    const bell = element.querySelector(".control-panel__bell--notifications");

    expect(bell?.querySelector('i[appIcon][icon="bell"]')).not.toBeNull();
    expect(bell?.querySelector(".attention")).not.toBeNull();
    expect(element.querySelectorAll(".control-panel__bell--notifications")).toHaveLength(1);
  });

  it("открывает уведомления и закрывает их через clickOutside", async () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLElement>(".control-panel__bell--notifications")?.click();
    fixture.detectChanges();
    expect(element.querySelector(".control-panel__notifications")).not.toBeNull();

    document.body.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.showNotifications).toBe(false);
    expect(element.querySelector(".control-panel__notifications")).toBeNull();
  });

  it("сохраняет действие выхода и ссылку аватара на профиль", () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;
    const emitLogout = vi.spyOn(fixture.componentInstance.logout, "emit");
    const actions = element.querySelectorAll<HTMLElement>(".control-panel__action");

    expect(actions[1].querySelector(".control-panel__bell--notifications")).toBeNull();
    actions[1].click();
    expect(emitLogout).toHaveBeenCalledOnce();
    expect(element.querySelector(".user")?.getAttribute("href")).toBe("/office/profile/42");
  });
});
