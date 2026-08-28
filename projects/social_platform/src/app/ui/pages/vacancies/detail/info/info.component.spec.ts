/** @format */

import { signal } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { DeferBlockBehavior, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { API_URL } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { Project } from "@domain/project/project.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyInfoComponent } from "./info.component";

describe("VacancyInfoComponent", () => {
  it("показывает релевантную подсказку сопроводительного письма", async () => {
    const project = Project.default();
    project.id = 5;
    project.name = "Проект";
    project.links = [];
    const vacancy = Object.assign(new Vacancy(), {
      id: 10,
      project,
      requiredSkills: [],
      description: "",
      requiredExperience: "",
      workFormat: "",
      city: null,
      salary: "",
      workSchedule: "",
    });
    const form = new FormBuilder().group({
      whyMe: [""],
      accompanyingFile: [""],
    });
    const detailService = {
      initializeDetailInfo: vi.fn(),
      initializeDetailInfoQueryParams: vi.fn(),
      initCheckDescription: vi.fn(),
      initCheckSkills: vi.fn(),
      openVacancyResponses: vi.fn(),
      closeVacancyResponses: vi.fn(),
      loadVacancyResponses: vi.fn(),
      acceptVacancyResponse: vi.fn(),
      declineVacancyResponse: vi.fn(),
      submitVacancyResponse: vi.fn(),
      closeSendResponseModal: vi.fn(),
    };
    const uiService = {
      vacancy: signal(vacancy),
      openModal: signal(true),
      responsesModal: signal(false),
      responses: signal([]),
      responsesLoading: signal(false),
      responsesError: signal(null),
      processingResponseIds: signal([]),
      sendForm: form,
      sendFormIsSubmittingFlag: signal(false),
      applyResponseModalOpen: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VacancyInfoComponent],
      providers: [
        { provide: API_URL, useValue: "" },
        provideHttpClient(),
        provideRouter([]),
        { provide: ExpandService, useValue: { checkExpandable: vi.fn(), expanded: signal({}) } },
      ],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    })
      .overrideComponent(VacancyInfoComponent, {
        remove: {
          providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
        },
        add: {
          providers: [
            { provide: VacancyDetailInfoService, useValue: detailService },
            { provide: VacancyDetailUIInfoService, useValue: uiService },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(VacancyInfoComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe(
      "Расскажите, почему вам интересна вакансия и чем вы можете быть полезны проекту",
    );

    uiService.openModal.set(false);
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
});
