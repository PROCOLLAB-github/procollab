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
    fixture.componentRef.setInput("vacancy", {
      id: 1,
      name: "Test Vacancy",
      description: "",
      requiredSkills: [],
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
