/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MembersFiltersComponent } from "./members-filters.component";
import { provideRouter } from "@angular/router";
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
});
