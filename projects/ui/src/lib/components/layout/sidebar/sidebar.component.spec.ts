/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SidebarComponent } from "./sidebar.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
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
  it("показывает бренд экземпляра и ссылку его программы", () => {
    fixture.componentRef.setInput("logoSrc", "/brand/logo.png");
    fixture.componentRef.setInput("logoName", "Сознание права");
    fixture.componentRef.setInput("logoLink", "/office/program/1");
    fixture.componentRef.setInput("logoDark", true);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector(".sidebar__logo");
    expect(logo.getAttribute("href")).toBe("/office/program/1");
    expect(logo.querySelector("img").getAttribute("alt")).toBe("Сознание права");
    expect(logo.querySelector(".instance-logo--dark")).toBeTruthy();
  });

  it("keeps the logo as a keyboard reachable link within the current environment", () => {
    const logo = fixture.nativeElement.querySelector(".sidebar__logo") as HTMLAnchorElement;
    expect(logo.getAttribute("href")).toBe("/office/feed");
    expect(logo.tabIndex).toBe(0);
  });
});
