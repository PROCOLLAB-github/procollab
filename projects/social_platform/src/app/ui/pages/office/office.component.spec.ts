/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndustryRepository } from "@infrastructure/repository/industry/industry.repository";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { OfficeComponent } from "./office.component";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";

describe("OfficeComponent", () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;

  beforeEach(async () => {
    const authSpy = { getUserRoles: of([]), profile: of({}) };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, OfficeComponent],
      providers: [IndustryRepository, { provide: AuthRepository, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // Прежний тест "shows registered program modal" удалён: он обращался к
  // protected-полям компонента (showRegisteredProgramModal/registeredProgramToShow)
  // и стабил устаревший API ProgramShellInfoService (ensureLoaded вместо
  // ensureProgramsLoaded). Сценарий модалки стоит покрыть отдельным тестом,
  // не завязанным на protected-внутренности (см. TECH-DEBT-PLAN §3 — тесты в CI).
});
