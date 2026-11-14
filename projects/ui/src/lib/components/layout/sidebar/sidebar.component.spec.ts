/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SidebarComponent } from "./sidebar.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Router } from "@angular/router";
import { API_URL } from "@corelib";

describe("SidebarComponent", () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    // SUT инжектит сервисы providedIn: "root" (часть из них через ApiService требует
    // токен API_URL) и Router. AuthService удалён. logoSrc — required @Input.
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SidebarComponent],
      providers: [{ provide: API_URL, useValue: "" }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("logoSrc", "");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("keeps the logo as a keyboard reachable link within the current environment", () => {
    const logo = fixture.nativeElement.querySelector(".sidebar__logo") as HTMLAnchorElement;
    expect(logo.getAttribute("href")).toBe("/office/feed");
    expect(logo.tabIndex).toBe(0);
  });

  it("expands the program submenu without navigating away from the current page", () => {
    fixture.componentRef.setInput("navItems", [
      {
        name: "программы",
        link: "program/all",
        icon: "program",
        children: [{ name: "я организую", link: "program/managed", icon: "settings" }],
      },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector<HTMLButtonElement>(".sidebar-nav__expand")!;
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(root.querySelector(".sidebar-nav__child")).toBeNull();
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector(".sidebar-nav__child")?.textContent).toContain("я организую");
    expect(
      root.querySelector(".sidebar-nav__child use")?.getAttribute("href") ??
        root.querySelector(".sidebar-nav__child use")?.getAttribute("xlink:href"),
    ).toContain("#settings");
    toggle.click();
    fixture.detectChanges();
    expect(root.querySelector(".sidebar-nav__child")).toBeNull();
  });

  it("opens the submenu when navigation items arrive on the managed programs route", () => {
    vi.spyOn(TestBed.inject(Router), "url", "get").mockReturnValue(
      "/office/program/managed?search=проект&offset=10",
    );
    fixture.componentRef.setInput("navItems", [
      {
        name: "программы",
        link: "program/all",
        icon: "program",
        children: [{ name: "я организую", link: "program/managed" }],
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".sidebar-nav__child")?.textContent).toContain(
      "я организую",
    );
  });
});
