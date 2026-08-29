/** @format */

import { Component, input, output, signal } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, DeferBlockBehavior, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { API_URL } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { Project } from "@domain/project/project.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyInfoComponent } from "./info.component";
import { FileService } from "@corelib";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

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
      attachProcollabCv: vi.fn(),
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
      procollabCvLoading: signal(false),
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

@Component({
  selector: "app-modal",
  template: "<ng-content></ng-content>",
})
class ModalStubComponent {
  readonly open = input.required<boolean>();
  readonly openChange = output<boolean>();
}

describe("VacancyInfoComponent PROCOLLAB CV", () => {
  let detailService: any;
  let ui: VacancyDetailUIInfoService;
  let fixture: ComponentFixture<VacancyInfoComponent>;

  beforeEach(async () => {
    detailService = {
      initializeDetailInfo: vi.fn(),
      initializeDetailInfoQueryParams: vi.fn(),
      attachProcollabCv: vi.fn(),
      initCheckDescription: vi.fn(),
      initCheckSkills: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VacancyInfoComponent],
      providers: [
        provideRouter([]),
        { provide: FileService, useValue: { uploadFile: vi.fn(), deleteFile: vi.fn() } },
        { provide: SnackbarService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    })
      .overrideComponent(VacancyInfoComponent, {
        remove: {
          imports: [ModalComponent],
          providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
        },
        add: {
          imports: [ModalStubComponent],
          providers: [
            { provide: VacancyDetailInfoService, useValue: detailService },
            VacancyDetailUIInfoService,
            ExpandService,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VacancyInfoComponent);
    ui = fixture.debugElement.injector.get(VacancyDetailUIInfoService);
    ui.applySetVacancies(
      Object.assign(new Vacancy(), {
        id: 10,
        project: Project.default(),
        requiredSkills: [],
        description: "",
        city: null,
        workFormat: "",
        requiredExperience: "",
        workSchedule: "",
        salary: "",
      }),
    );
    ui.openModal.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function procollabCvButton(): HTMLButtonElement {
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="attach-procollab-cv"] button',
    ) as HTMLButtonElement | null;
    if (!button) throw new Error("PROCOLLAB CV button not found");
    return button;
  }

  it("разрешает прикрепить PROCOLLAB CV при пустом accompanyingFile", () => {
    const button = procollabCvButton();

    expect(button.disabled).toBe(false);
    button.click();
    expect(detailService.attachProcollabCv).toHaveBeenCalledTimes(1);
  });

  it("блокирует кнопку при заполненном accompanyingFile и включает после очистки", () => {
    ui.sendForm.controls.accompanyingFile.setValue("https://example.test/cv.pdf");
    fixture.detectChanges();
    expect(procollabCvButton().disabled).toBe(true);

    ui.sendForm.controls.accompanyingFile.setValue("");
    fixture.detectChanges();
    expect(procollabCvButton().disabled).toBe(false);
  });

  it("показывает loader и блокирует кнопку во время прикрепления", () => {
    ui.applyProcollabCvLoading(true);
    fixture.detectChanges();

    const button = procollabCvButton();
    expect(button.disabled).toBe(true);
    expect(button.querySelector("app-loader")).not.toBeNull();
  });
});
