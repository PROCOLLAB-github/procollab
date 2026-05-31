/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgramMainComponent } from "./main.component";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { ProgramMainInfoService } from "@api/program/facades/program-main-info.service";
import { ProgramMainUIInfoService } from "@api/program/facades/ui/program-main-ui-info.service";

describe("MainComponent", () => {
  let component: ProgramMainComponent;
  let fixture: ComponentFixture<ProgramMainComponent>;

  beforeEach(async () => {
    const programMainInfoServiceSpy = {
      initializationMainPrograms: jasmine.createSpy("initializationMainPrograms"),
      destroy: jasmine.createSpy("destroy"),
      onTogglePparticipating: jasmine.createSpy("onTogglePparticipating"),
    };

    const programMainUIInfoServiceSpy = {
      programs: signal([]),
      isPparticipating: signal(false),
      programOptionsFilter: [],
    };

    await TestBed.configureTestingModule({
      imports: [ProgramMainComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProgramMainComponent, {
        remove: { providers: [ProgramMainInfoService, ProgramMainUIInfoService] },
        add: {
          providers: [
            { provide: ProgramMainInfoService, useValue: programMainInfoServiceSpy },
            { provide: ProgramMainUIInfoService, useValue: programMainUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
