/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Notification } from "@domain/notification/notification.model";
import { ProfileControlPanelComponent } from "./profile-control-panel.component";

describe("ProfileControlPanelComponent notification center", () => {
  let fixture: ComponentFixture<ProfileControlPanelComponent>;
  let component: ProfileControlPanelComponent;

  const unread: Notification = {
    id: 1,
    type: "program_news_published",
    category: "program",
    title: "Опубликована новость программы",
    message: "В программе появилась новая новость.",
    actionUrl: "/office/program/5",
    readAt: null,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    actor: {
      id: 2,
      firstName: "Анна",
      lastName: "Иванова",
      avatar: "https://example.com/avatar.png",
    },
  };
  const read: Notification = {
    ...unread,
    id: 2,
    type: "program_material_published",
    title: "Добавлен новый материал",
    actionUrl: null,
    readAt: new Date().toISOString(),
    actor: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileControlPanelComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileControlPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("user", null);
    fixture.componentRef.setInput("notifications", [unread, read]);
    fixture.componentRef.setInput("unreadCount", 1);
    fixture.detectChanges();
  });

  function openPopup(): void {
    const bell: HTMLButtonElement = fixture.nativeElement.querySelector(".control-panel__bell");
    bell.click();
    fixture.detectChanges();
  }

  it("показывает badge и точный aria-label только при unreadCount > 0", () => {
    const bell: HTMLButtonElement = fixture.nativeElement.querySelector(".control-panel__bell");
    expect(fixture.nativeElement.querySelector(".control-panel__attention")).not.toBeNull();
    expect(bell.getAttribute("aria-label")).toBe("Уведомления, непрочитанных: 1");

    fixture.componentRef.setInput("unreadCount", 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".control-panel__attention")).toBeNull();
  });

  it("открывает popup native button и закрывает по Escape", () => {
    const openChange = vi.fn();
    component.openChange.subscribe(openChange);

    openPopup();
    expect(fixture.nativeElement.querySelector("[role='dialog']")).not.toBeNull();
    expect(openChange).toHaveBeenCalledWith(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role='dialog']")).toBeNull();
    expect(openChange).toHaveBeenLastCalledWith(false);
  });

  it("закрывает popup через clickOutside handler", () => {
    openPopup();

    component.onClickOutside();
    fixture.detectChanges();

    expect(component.showNotifications).toBe(false);
  });

  it("различает unread/read и показывает avatar с fallback", () => {
    openPopup();

    const items = fixture.nativeElement.querySelectorAll(".notification-item");
    expect(items[0].classList).toContain("notification-item--unread");
    expect(items[1].classList).not.toContain("notification-item--unread");
    expect(fixture.nativeElement.querySelectorAll(".notification-item__avatar")).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll(".notification-item__fallback")).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain("мин назад");
  });

  it("emits mark all и не закрывает popup", () => {
    const markAllRead = vi.fn();
    component.markAllRead.subscribe(markAllRead);
    openPopup();

    fixture.nativeElement.querySelector(".notifications__mark-all").click();
    fixture.detectChanges();

    expect(markAllRead).toHaveBeenCalledOnce();
    expect(component.showNotifications).toBe(true);
  });

  it("показывает empty state", () => {
    fixture.componentRef.setInput("notifications", []);
    fixture.componentRef.setInput("unreadCount", 0);
    openPopup();

    expect(fixture.nativeElement.textContent).toContain("Пока нет уведомлений");
  });

  it("показывает initial error и emits retry", () => {
    const retry = vi.fn();
    component.retry.subscribe(retry);
    fixture.componentRef.setInput("notifications", []);
    fixture.componentRef.setInput("error", "Не удалось загрузить уведомления");
    openPopup();

    const retryButton: HTMLButtonElement =
      fixture.nativeElement.querySelector(".notifications__retry");
    retryButton.click();

    expect(fixture.nativeElement.textContent).toContain("Не удалось загрузить уведомления");
    expect(retry).toHaveBeenCalledOnce();
  });

  it("emits load more и показывает loading label", () => {
    const loadMore = vi.fn();
    component.loadMore.subscribe(loadMore);
    fixture.componentRef.setInput("hasMore", true);
    openPopup();

    fixture.nativeElement.querySelector(".notifications__footer-button").click();
    expect(loadMore).toHaveBeenCalledOnce();

    fixture.componentRef.setInput("loadingMore", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Загрузка...");
  });

  it("emits notification click и закрывается только для safe action", () => {
    const notificationClick = vi.fn();
    component.notificationClick.subscribe(notificationClick);
    openPopup();

    const items: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll(".notification-item");
    items[0].click();
    fixture.detectChanges();

    expect(notificationClick).toHaveBeenCalledWith(unread);
    expect(component.showNotifications).toBe(false);

    openPopup();
    const refreshedItems: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll(".notification-item");
    refreshedItems[1].click();
    expect(component.showNotifications).toBe(true);
  });

  it("сохраняет logout action", () => {
    const logout = vi.fn();
    component.logout.subscribe(logout);

    fixture.nativeElement.querySelector(".control-panel__logout").click();

    expect(logout).toHaveBeenCalledOnce();
  });
});
