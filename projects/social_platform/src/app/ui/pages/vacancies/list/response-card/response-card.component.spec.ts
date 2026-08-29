/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResponseCardComponent } from "./response-card.component";
import { provideRouter } from "@angular/router";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { of } from "rxjs";
import { FileService } from "projects/core/src/lib/services/file/file.service";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("ResponseCardComponent", () => {
  let component: ResponseCardComponent;
  let fixture: ComponentFixture<ResponseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseCardComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        {
          provide: FileService,
          useValue: { deleteFile: vi.fn().mockReturnValue(of(undefined)) },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("response", createResponse(null));
    fixture.detectChanges();
  });

  function createResponse(isApproved: boolean | null): VacancyResponse {
    return Object.assign(new VacancyResponse(), {
      id: 1,
      vacancy: Object.assign(new Vacancy(), {
        id: 5,
        role: "Frontend-разработчик",
        project: { id: 8, name: "Цифровой кампус" },
      }),
      whyMe: "Подробное сопроводительное письмо",
      isApproved,
      datetimeCreated: "2026-08-28T12:00:00Z",
      accompanyingFile: null,
    });
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it.each([
    [null, "На рассмотрении", "pending"],
    [true, "Принят", "accepted"],
    [false, "Отклонён", "declined"],
  ] as const)("отображает понятный статус для isApproved=%s", (isApproved, label, className) => {
    fixture.componentRef.setInput("response", createResponse(isApproved));
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector(".response__status");
    expect(status.textContent.trim()).toBe(label);
    expect(status.classList).toContain(`response__status--${className}`);
  });

  it("показывает вакансию, проект и дату отклика", () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain("Frontend-разработчик");
    expect(text).toContain("Цифровой кампус");
    expect(text).toContain("28.08.2026");
  });

  it("показывает прикреплённый файл без действия удаления", () => {
    const response = createResponse(null);
    response.accompanyingFile = {
      link: "https://example.test/cv.pdf",
      name: "resume.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      size: 1024,
    };
    fixture.componentRef.setInput("response", response);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("resume.pdf");
    expect(fixture.nativeElement.querySelector(".file__icon--delete")).toBeNull();
  });
});
