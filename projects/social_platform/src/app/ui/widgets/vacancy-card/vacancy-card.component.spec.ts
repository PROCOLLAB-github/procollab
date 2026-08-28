/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VacancyCardComponent } from "./vacancy-card.component";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";

describe("VacancyCardComponent", () => {
  let component: VacancyCardComponent;
  let fixture: ComponentFixture<VacancyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyCardComponent],
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

    fixture = TestBed.createComponent(VacancyCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("vacancy", createVacancy(true));
    fixture.detectChanges();
  });

  function createVacancy(isActive: boolean) {
    return {
      id: 1,
      role: "Test Vacancy",
      description: "",
      requiredSkills: [],
      isActive,
    };
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it.each([
    [true, "Активна", "active"],
    [false, "Закрыта", "closed"],
  ] as const)("показывает статус вакансии isActive=%s", (isActive, label, className) => {
    fixture.componentRef.setInput("vacancy", createVacancy(isActive));
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector(".vacancy__status");
    expect(status.textContent.trim()).toBe(label);
    expect(status.classList).toContain(`vacancy__status--${className}`);
  });
});
