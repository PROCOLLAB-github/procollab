/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndustryRepository } from "@infrastructure/repository/industry/industry.repository";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { OfficeComponent } from "./office.component";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";

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

  it("shows registered program modal when member program present and not seen", () => {
    // ensure localStorage has no seen flag
    try {
      localStorage.removeItem(`program_${(component as any).profile?.id}_registered_modal_seen_1`);
    } catch (e) {
      // ignore
    }

    const stubPrograms = [
      { id: 1, isUserMember: true, datetimeRegistrationEnds: new Date(Date.now() + 86400000).toISOString() },
    ];

    const programStub: Partial<ProgramShellInfoService> = {
      actualPrograms: () => stubPrograms as any,
      ensureLoaded: () => {},
    };

    // override provider and recreate component
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, OfficeComponent],
      providers: [
        IndustryRepository,
        { provide: AuthRepository, useValue: { getUserRoles: of([]), profile: of({}) } },
        { provide: ProgramShellInfoService, useValue: programStub },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(OfficeComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.showRegisteredProgramModal()).toBeTrue();
    expect(newComponent.registeredProgramToShow).toBeTruthy();
    expect(newComponent.registeredProgramToShow?.id).toBe(1);
  });
});
