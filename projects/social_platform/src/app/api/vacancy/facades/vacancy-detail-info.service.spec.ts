/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FileService, ValidationService } from "@corelib";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ok, fail } from "@domain/shared/result.type";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { of, Subject, throwError } from "rxjs";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { ExpandService } from "../../expand/expand.service";
import { AcceptResponseUseCase } from "../use-cases/accept-response.use-case";
import { GetVacancyResponsesUseCase } from "../use-cases/get-vacancy-responses.use-case";
import { RejectResponseUseCase } from "../use-cases/reject-response.use-case";
import { SendVacancyResponseUseCase } from "../use-cases/send-vacancy-response.use-case";
import { VacancyDetailUIInfoService } from "./ui/vacancy-detail-ui-info.service";
import { VacancyDetailInfoService } from "./vacancy-detail-info.service";

describe("VacancyDetailInfoService", () => {
  let service: VacancyDetailInfoService;
  let ui: VacancyDetailUIInfoService;
  let sendUseCase: any;
  let getResponsesUseCase: any;
  let acceptUseCase: any;
  let rejectUseCase: any;
  let downloadCvUseCase: any;
  let fileService: any;
  let snackbar: any;

  beforeEach(() => {
    sendUseCase = { execute: vi.fn() };
    getResponsesUseCase = { execute: vi.fn() };
    acceptUseCase = { execute: vi.fn() };
    rejectUseCase = { execute: vi.fn() };
    downloadCvUseCase = { execute: vi.fn() };
    fileService = { uploadFile: vi.fn() };
    snackbar = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        VacancyDetailInfoService,
        VacancyDetailUIInfoService,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({}),
            queryParams: of({}),
            snapshot: { paramMap: { get: () => "10" } },
          },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: SendVacancyResponseUseCase, useValue: sendUseCase },
        { provide: GetVacancyResponsesUseCase, useValue: getResponsesUseCase },
        { provide: AcceptResponseUseCase, useValue: acceptUseCase },
        { provide: RejectResponseUseCase, useValue: rejectUseCase },
        { provide: DownloadCvUseCase, useValue: downloadCvUseCase },
        { provide: FileService, useValue: fileService },
        { provide: ValidationService, useValue: { getFormValidation: () => true } },
        { provide: ExpandService, useValue: { checkExpandable: vi.fn(), expanded: signal({}) } },
        { provide: SnackbarService, useValue: snackbar },
      ],
    });

    service = TestBed.inject(VacancyDetailInfoService);
    ui = TestBed.inject(VacancyDetailUIInfoService);
    ui.applySetVacancies(
      Object.assign(new Vacancy(), {
        id: 10,
        canRespond: true,
        canManageResponses: false,
        hasResponded: false,
      }),
    );
    ui.sendForm.setValue({
      whyMe: "Подробное сопроводительное письмо",
      accompanyingFile: "https://example.test/cv.pdf",
    });
  });

  it("после успешного POST обновляет applicant state без reload", () => {
    sendUseCase.execute.mockReturnValue(of(ok(undefined)));

    service.submitVacancyResponse();

    expect(sendUseCase.execute).toHaveBeenCalledTimes(1);
    expect(sendUseCase.execute).toHaveBeenCalledExactlyOnceWith(10, {
      whyMe: "Подробное сопроводительное письмо",
      accompanyingFile: "https://example.test/cv.pdf",
    });
    expect(ui.vacancy()?.hasResponded).toBe(true);
    expect(ui.vacancy()?.canRespond).toBe(false);
    expect(ui.vacancy()?.responseStatus).toBe("pending");
    expect(ui.openModal()).toBe(false);
    expect(snackbar.success).toHaveBeenCalledExactlyOnceWith("Отклик успешно отправлен");
  });

  it("не открывает форму повторного отклика через query param", () => {
    ui.vacancy.update(vacancy =>
      vacancy
        ? Object.assign(new Vacancy(), vacancy, { hasResponded: true, canRespond: false })
        : vacancy,
    );

    ui.applyNoResponseOpenModal({ sendResponse: true });

    expect(ui.openModal()).toBe(false);
  });

  it.each([
    [["Вы уже откликнулись на эту вакансию."], "Вы уже откликнулись на эту вакансию"],
    [
      ["Участник проекта не может откликнуться на его вакансию."],
      "Нельзя откликнуться на вакансию проекта, в котором вы уже участвуете",
    ],
  ])("показывает конкретную безопасную validation error", (error, message) => {
    sendUseCase.execute.mockReturnValue(
      of(fail({ kind: "send_vacancy_response_error", cause: { status: 400, error } })),
    );

    service.submitVacancyResponse();

    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith(message);
    expect(ui.vacancy()?.hasResponded).toBe(false);
  });

  it("блокирует повторную отправку пока первый POST выполняется", () => {
    sendUseCase.execute.mockReturnValue(new Subject());

    service.submitVacancyResponse();
    service.submitVacancyResponse();

    expect(sendUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("скачивает Blob, загружает PDF File и сохраняет URL в accompanyingFile", () => {
    const blob = new Blob(["cv-content"], { type: "application/pdf" });
    downloadCvUseCase.execute.mockReturnValue(of(ok(blob)));
    fileService.uploadFile.mockReturnValue(of({ url: "https://example.test/procollab-cv.pdf" }));
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();

    expect(downloadCvUseCase.execute).toHaveBeenCalledTimes(1);
    expect(fileService.uploadFile).toHaveBeenCalledTimes(1);
    const uploadedFile = fileService.uploadFile.mock.calls[0][0] as File;
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toBe("PROCOLLAB_CV.pdf");
    expect(uploadedFile.type).toBe("application/pdf");
    expect(ui.sendForm.controls.accompanyingFile.value).toBe(
      "https://example.test/procollab-cv.pdf",
    );
    expect(ui.sendForm.controls.accompanyingFile.valid).toBe(true);
    expect(snackbar.success).toHaveBeenCalledExactlyOnceWith("Резюме PROCOLLAB прикреплено");
  });

  it("не запускает прикрепление, если accompanyingFile уже заполнен", () => {
    service.attachProcollabCv();

    expect(downloadCvUseCase.execute).not.toHaveBeenCalled();
    expect(fileService.uploadFile).not.toHaveBeenCalled();
  });

  it("держит отдельный loader и блокирует повторный click до завершения upload", () => {
    const upload = new Subject<{ url: string }>();
    downloadCvUseCase.execute.mockReturnValue(of(ok(new Blob(["cv"]))));
    fileService.uploadFile.mockReturnValue(upload);
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();
    service.attachProcollabCv();

    expect(ui.procollabCvLoading()).toBe(true);
    expect(downloadCvUseCase.execute).toHaveBeenCalledTimes(1);
    expect(fileService.uploadFile).toHaveBeenCalledTimes(1);

    upload.next({ url: "https://example.test/procollab-cv.pdf" });
    upload.complete();

    expect(ui.procollabCvLoading()).toBe(false);
  });

  it("показывает cooldown без изменения формы", () => {
    downloadCvUseCase.execute.mockReturnValue(
      of(
        fail({
          kind: "download_cv_error",
          cause: { status: 400, error: { seconds_after_retry: 17 } },
        }),
      ),
    );
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();

    expect(ui.sendForm.controls.accompanyingFile.value).toBe("");
    expect(fileService.uploadFile).not.toHaveBeenCalled();
    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith(
      "CV недавно формировалось. Попробуйте снова через 17 сек.",
    );
    expect(ui.procollabCvLoading()).toBe(false);
  });

  it("показывает контролируемую generic download error без изменения формы", () => {
    downloadCvUseCase.execute.mockReturnValue(
      of(fail({ kind: "download_cv_error", cause: { status: 500, error: "raw backend error" } })),
    );
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();

    expect(ui.sendForm.controls.accompanyingFile.value).toBe("");
    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith("Не удалось сформировать CV PROCOLLAB.");
    expect(snackbar.error).not.toHaveBeenCalledWith(expect.stringContaining("raw backend error"));
  });

  it("показывает cooldown fallback, если backend не вернул seconds_after_retry", () => {
    downloadCvUseCase.execute.mockReturnValue(
      of(fail({ kind: "download_cv_error", cause: { status: 400, error: {} } })),
    );
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();

    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith(
      "Не удалось сформировать CV. Попробуйте немного позже.",
    );
    expect(ui.sendForm.controls.accompanyingFile.value).toBe("");
  });

  it("показывает контролируемую upload error без изменения формы", () => {
    downloadCvUseCase.execute.mockReturnValue(of(ok(new Blob(["cv"]))));
    fileService.uploadFile.mockReturnValue(throwError(() => new Error("raw upload error")));
    ui.sendForm.controls.accompanyingFile.setValue("");

    service.attachProcollabCv();

    expect(ui.sendForm.controls.accompanyingFile.value).toBe("");
    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith(
      "CV сформировано, но не удалось прикрепить файл. Попробуйте ещё раз.",
    );
    expect(ui.procollabCvLoading()).toBe(false);
  });

  it("не отправляет отклик, пока PROCOLLAB CV загружается", () => {
    ui.applyProcollabCvLoading(true);

    service.submitVacancyResponse();

    expect(sendUseCase.execute).not.toHaveBeenCalled();
  });

  it("accept повторно загружает список, сохраняет историю и закрывает вакансию", () => {
    const pending = Object.assign(new VacancyResponse(), { id: 1, isApproved: null });
    const accepted = Object.assign(new VacancyResponse(), { id: 1, isApproved: true });
    ui.vacancy.update(vacancy =>
      vacancy ? Object.assign(new Vacancy(), vacancy, { canManageResponses: true }) : vacancy,
    );
    getResponsesUseCase.execute
      .mockReturnValueOnce(of(ok([pending])))
      .mockReturnValueOnce(of(ok([accepted])));
    acceptUseCase.execute.mockReturnValue(of(ok(undefined)));

    service.openVacancyResponses();
    service.acceptVacancyResponse(1);

    expect(getResponsesUseCase.execute).toHaveBeenCalledTimes(2);
    expect(acceptUseCase.execute).toHaveBeenCalledExactlyOnceWith(1);
    expect(ui.responses()).toEqual([accepted]);
    expect(ui.vacancy()?.isActive).toBe(false);
    expect(snackbar.success).toHaveBeenCalledWith("Кандидат принят в проект");
  });

  it("decline повторно загружает список и оставляет отклонённый response на экране", () => {
    const pending = Object.assign(new VacancyResponse(), { id: 1, isApproved: null });
    const declined = Object.assign(new VacancyResponse(), { id: 1, isApproved: false });
    ui.vacancy.update(vacancy =>
      vacancy ? Object.assign(new Vacancy(), vacancy, { canManageResponses: true }) : vacancy,
    );
    getResponsesUseCase.execute
      .mockReturnValueOnce(of(ok([pending])))
      .mockReturnValueOnce(of(ok([declined])));
    rejectUseCase.execute.mockReturnValue(of(ok(undefined)));

    service.openVacancyResponses();
    service.declineVacancyResponse(1);

    expect(getResponsesUseCase.execute).toHaveBeenCalledTimes(2);
    expect(rejectUseCase.execute).toHaveBeenCalledExactlyOnceWith(1);
    expect(ui.responses()).toEqual([declined]);
    expect(snackbar.success).toHaveBeenCalledWith("Отклик отклонён");
  });
});
