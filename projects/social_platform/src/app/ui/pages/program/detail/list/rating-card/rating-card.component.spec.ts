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

describe("RatingCardComponent", () => {
  let component: RatingCardComponent;
  let fixture: ComponentFixture<RatingCardComponent>;

  beforeEach(async () => {
    const projectRatingSpy = jasmine.createSpyObj("ProjectRatingRepositoryPort", [
      "getAll",
      "postFilters",
      "rate",
    ]);

    const programDetailMainSpy = jasmine.createSpyObj("ProgramDetailMainUIInfoService", [], {
      program: of({}),
    });

    const authPortSpy = jasmine.createSpyObj(
      "AuthRepositoryPort",
      ["fetchProfile", "fetchUserRoles", "fetchChangeableRoles"],
      {
        fetchProfile: of({}),
        fetchUserRoles: of([]),
        fetchChangeableRoles: of([]),
      }
    );

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
