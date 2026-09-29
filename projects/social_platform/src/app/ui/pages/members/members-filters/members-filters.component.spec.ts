/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MembersFiltersComponent } from "./members-filters.component";
import { provideRouter, Router } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { SearchesService } from "@api/searches/searches.service";
import { LoggerService } from "@corelib";

describe("MembersFiltersComponent ", () => {
  let component: MembersFiltersComponent;
  let fixture: ComponentFixture<MembersFiltersComponent>;

  beforeEach(async () => {
    const searchesServiceSpy = {
      inlineSpecs: signal([]),
      inlineSkills: signal([]),
      onSearchSpec: vi.fn(),
      onSearchSkill: vi.fn(),
    };

    const loggerServiceSpy = {
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MembersFiltersComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: SearchesService, useValue: searchesServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersFiltersComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("общий сброс не запускает конкурирующие переходы от отдельных контролов", () => {
    const form = new FormGroup({
      keySkill: new FormControl("Angular"),
      speciality: new FormControl("Front-end"),
      age: new FormControl([null, null]),
      isMosPolytechStudent: new FormControl(false),
    });
    fixture.componentRef.setInput("filterForm", form);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigate").mockResolvedValue(true);
    // Как в MembersInfoService: каждый контрол отдельно синхронизируется с URL.
    const subscriptions = Object.values(form.controls).map(control =>
      control.valueChanges.subscribe(() => router.navigate([], { queryParamsHandling: "merge" })),
    );
    component.clearFilters();
    expect(form.controls.keySkill.value).toBeNull();
    expect(form.controls.speciality.value).toBeNull();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][1]?.queryParams).toMatchObject({
      skills__contains: undefined,
      speciality__icontains: undefined,
    });
    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
});
