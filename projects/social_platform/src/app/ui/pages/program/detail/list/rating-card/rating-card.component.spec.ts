/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RatingCardComponent } from "./rating-card.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { signal } from "@angular/core";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";

describe("RatingCardComponent", () => {
  let component: RatingCardComponent;
  let fixture: ComponentFixture<RatingCardComponent>;

  beforeEach(async () => {
    const projectRatingSpy = { getAll: vi.fn(), postFilters: vi.fn(), rate: vi.fn() };

    const programDetailMainSpy = { program: of({}) };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    const industrySpy = {
      industries: signal([]),
      getAll: () => of([]),
      getOne: () => undefined,
    };

    await TestBed.configureTestingModule({
      imports: [RatingCardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectRatingRepositoryPort, useValue: projectRatingSpy },
        { provide: ProgramDetailMainUIInfoService, useValue: programDetailMainSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: IndustryRepositoryPort, useValue: industrySpy },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
