/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { By } from "@angular/platform-browser";
import { Notification } from "@domain/notification/notification.model";
import { ProfileControlPanelComponent } from "./profile-control-panel.component";
import { IconComponent } from "../../primitives/icon/icon.component";

describe("ProfileControlPanelComponent notification center", () => {
  let fixture: ComponentFixture<ProfileControlPanelComponent>;
  let component: ProfileControlPanelComponent;

  const unread: Notification = {
    id: 1,
    type: "program_news_published",
    category: "program",
    title: "Новая публикация",
    message: "В программе «Digital Future Challenge 2026» появилась новость.",
    imageUrl: "https://example.com/program.png",
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
    imageUrl: null,
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

  it("сохраняет popup внутри stacking context control-panel при открытии и закрытии", () => {
    const panel = fixture.nativeElement.querySelector(".control-panel") as HTMLElement;
    const bell = panel.querySelector("button.control-panel__bell") as HTMLButtonElement;
    expect(bell.getAttribute("aria-expanded")).toBe("false");
    expect(panel.querySelector(".control-panel__notifications")).toBeNull();

    openPopup();
    expect(bell.getAttribute("aria-expanded")).toBe("true");
    expect(panel.querySelector(".control-panel__notification-area [role='dialog']")).not.toBeNull();
    expect(panel.querySelector("[role='dialog']")?.closest(".control-panel")).toBe(panel);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    expect(bell.getAttribute("aria-expanded")).toBe("false");
    expect(panel.querySelector(".control-panel__notifications")).toBeNull();
  });

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

  const programTypes = [
    ["program_news_published", "feed"],
    ["program_material_published", "file"],
    ["course_access_opened", "academic-hat"],
  ];

  function fallbackIcon(): string {
    return fixture.debugElement
      .query(By.css(".notification-item__fallback"))
      .query(By.directive(IconComponent))
      .componentInstance.icon();
  }

  it.each(programTypes)("%s показывает изображение программы вместо actor", (type, icon) => {
    fixture.componentRef.setInput("notifications", [{ ...unread, type }]);
    openPopup();
    const image: HTMLImageElement = fixture.nativeElement.querySelector(
      ".notification-item__avatar",
    );
    expect(image.src).toBe(unread.imageUrl);
    expect(image.src).not.toBe(unread.actor?.avatar);
    expect(fallbackIcon()).toBe(icon);
  });

  it.each(programTypes)("%s без imageUrl сохраняет %s и не показывает actor", (type, icon) => {
    for (const imageUrl of [null, undefined, ""]) {
      fixture.componentRef.setInput("notifications", [{ ...unread, type, imageUrl }]);
      if (!component.showNotifications) openPopup();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector(".notification-item__avatar")).toBeNull();
      expect(fallbackIcon()).toBe(icon);
    }
  });

  it.each([
    ["project_invite_created", "projects"],
    ["vacancy_response_created", "suitcase"],
    ["future_backend_type", "bell"],
  ])("%s сохраняет прежний выбор actor и fallback", (type, icon) => {
    fixture.componentRef.setInput("notifications", [{ ...unread, type }]);
    openPopup();
    expect(fixture.nativeElement.querySelector(".notification-item__avatar").src).toBe(
      unread.actor?.avatar,
    );
    fixture.componentRef.setInput("notifications", [{ ...unread, type, actor: null }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".notification-item__avatar")).toBeNull();
    expect(fallbackIcon()).toBe(icon);
  });

  it.each(programTypes)("ошибка изображения %s оставляет видимой иконку %s", (type, icon) => {
    fixture.componentRef.setInput("notifications", [{ ...unread, type }]);
    openPopup();
    const image: HTMLImageElement = fixture.nativeElement.querySelector(
      ".notification-item__avatar",
    );
    image.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(image.hidden).toBe(true);
    expect(image.src).toBe(unread.imageUrl);
    const fallback: HTMLElement = fixture.nativeElement.querySelector(
      ".notification-item__fallback",
    );
    expect(fallback.hidden).toBe(false);
    expect(getComputedStyle(fallback).display).not.toBe("none");
    expect(fallbackIcon()).toBe(icon);
  });

  it.each([
    [
      "program_news_published",
      "Новая публикация",
      "В программе «Digital Future Challenge 2026» появилась новость.",
    ],
    [
      "program_material_published",
      "Новый материал",
      "В программе «Digital Future Challenge 2026» добавлен материал «Регламент».",
    ],
    [
      "course_access_opened",
      "Открыт доступ к курсу",
      "В программе «Digital Future Challenge 2026» открыт доступ к курсу «Старт».",
    ],
  ])("%s отображает серверные тексты без преобразования", (type, title, message) => {
    fixture.componentRef.setInput("notifications", [{ ...unread, type, title, message }]);
    openPopup();
    expect(fixture.nativeElement.querySelector(".notification-item__title").textContent).toBe(
      title,
    );
    expect(fixture.nativeElement.querySelector(".notification-item__message").textContent).toBe(
      message,
    );
  });
});
