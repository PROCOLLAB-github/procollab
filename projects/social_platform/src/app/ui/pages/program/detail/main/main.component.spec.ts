/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgramDetailMainComponent } from "./main.component";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { ProgramDetailMainService } from "@api/program/facades/detail/program-detail-main-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";

describe("MainComponent", () => {
  let component: ProgramDetailMainComponent;
  let fixture: ComponentFixture<ProgramDetailMainComponent>;

  beforeEach(async () => {
    const programDetailMainServiceSpy = {
      initializationProgramDetailMain: jasmine.createSpy("initializationProgramDetailMain"),
      initScroll: jasmine.createSpy("initScroll"),
      destroy: jasmine.createSpy("destroy"),
      onAddNews: jasmine.createSpy("onAddNews").and.returnValue(of({ ok: true })),
      onDelete: jasmine.createSpy("onDelete"),
      onLike: jasmine.createSpy("onLike"),
      onEdit: jasmine.createSpy("onEdit").and.returnValue(of({ ok: true })),
      closeModal: jasmine.createSpy("closeModal"),
    };

    const programDetailMainUIInfoServiceSpy = {
      program: signal(undefined),
      showProgramModal: signal(false),
      showProgramModalErrorMessage: signal(""),
      registeredProgramModal: signal(false),
      contactLinks: signal([]),
      materialLinks: signal([]),
    };

    const expandServiceSpy = {
      descriptionExpandable: signal(false),
      readFullDescription: signal(""),
      onExpand: jasmine.createSpy("onExpand"),
    };

    const newsInfoServiceSpy = {
      news: signal([]),
    };

    const projectAdditionalServiceSpy = {
      isSend$: signal(null),
      errorAssignProjectToProgramModalMessage: signal(""),
      clearAssignProjectToProgramError: jasmine.createSpy("clearAssignProjectToProgramError"),
    };

    await TestBed.configureTestingModule({
      imports: [ProgramDetailMainComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProgramDetailMainComponent, {
        remove: {
          providers: [
            ProgramDetailMainService,
            ExpandService,
            NewsInfoService,
            ProjectAdditionalService,
          ],
        },
        add: {
          providers: [
            { provide: ProgramDetailMainService, useValue: programDetailMainServiceSpy },
            {
              provide: ProgramDetailMainUIInfoService,
              useValue: programDetailMainUIInfoServiceSpy,
            },
            { provide: ExpandService, useValue: expandServiceSpy },
            { provide: NewsInfoService, useValue: newsInfoServiceSpy },
            { provide: ProjectAdditionalService, useValue: projectAdditionalServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
