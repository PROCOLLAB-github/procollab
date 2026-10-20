/** @format */

import { TestBed } from "@angular/core/testing";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProgramManagementHttpAdapter } from "./program-management-http.adapter";
import { ManagementMaterial } from "@domain/program/program-management.model";
import { API_URL } from "@core/lib/providers";

describe("Контракт HTTP панели организатора", () => {
  let adapter: ProgramManagementHttpAdapter, http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: API_URL, useValue: "https://local.test" },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ProgramManagementHttpAdapter,
        { provide: LoggerService, useValue: { warn: vi.fn(), debug: vi.fn(), error: vi.fn() } },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
      ],
    });
    adapter = TestBed.inject(ProgramManagementHttpAdapter);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http?.verify();
    TestBed.resetTestingModule();
  });
  it("фильтры передаются серверу в snake_case, ответ преобразуется в camelCase", () => {
    adapter
      .projects(4, {
        search: "Город",
        offset: 20,
        limit: 20,
        evaluation: "not_evaluated",
        submission: "submitted",
        caseScope: "selected",
        caseName: "Экология",
      })
      .subscribe(page => expect(page.caseOptions).toEqual(["Экология"]));
    const request = http.expectOne(r => r.url.endsWith("/programs/4/management/projects/"));
    expect(request.request.params.get("case_scope")).toBe("selected");
    expect(request.request.params.get("case_name")).toBe("Экология");
    expect(request.request.params.get("offset")).toBe("20");
    expect(request.request.params.get("evaluation")).toBe("not_evaluated");
    request.flush({ count: 0, results: [], case_options: ["Экология"], is_competitive: true });
  });
  it("выгрузка участников передаёт те же фильтры региона и периода, что и список", () => {
    const query = {
      search: "Анна",
      offset: 25,
      limit: 25,
      submission: "all" as const,
      caseScope: "all" as const,
      regionScope: "selected" as const,
      region: "Москва",
      activity: "period" as const,
      activityFrom: "2026-10-01",
      activityTo: "2026-10-19",
    };
    adapter.participants(4, query).subscribe(page => expect(page.totalCount).toBe(100));
    const list = http.expectOne(r => r.url.endsWith("/participants/"));
    list.flush({ count: 30, total_count: 100, region_options: ["Москва"], results: [] });
    adapter.exportParticipants(4, query).subscribe();
    const file = http.expectOne(r => r.url.endsWith("/participants/export/"));
    expect(file.request.params.toString()).toBe(list.request.params.toString());
    expect(file.request.params.get("activity_from")).toBe("2026-10-01");
    expect(file.request.params.get("region")).toBe("Москва");
    expect(file.request.responseType).toBe("blob");
    file.flush(new Blob(["xlsx"]));
  });
  it("версия PATCH не теряет точность при преобразовании JSON", () => {
    const version = "2026-10-17T12:34:56.123456Z";
    adapter
      .save(4, "dates", {
        expectedUpdatedAt: version,
        datetimeProjectSubmissionEnds: null,
        confirmReopen: true,
      })
      .subscribe(p => expect(p.updatedAt).toBe(version));
    const request = http.expectOne(r => r.url.endsWith("/management/settings/dates/"));
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual({
      expected_updated_at: version,
      datetime_project_submission_ends: null,
      confirm_reopen: true,
    });
    request.flush({ updated_at: version });
  });
  it("выбор всех проектов использует те же фильтры и сохраняет оба вида ID", () => {
    adapter
      .selection(4, "projects", {
        search: "Город",
        offset: 20,
        limit: 20,
        submission: "submitted",
        caseScope: "selected",
        caseName: "Экология",
        evaluation: "not_evaluated",
      })
      .subscribe(result => expect(result.projects?.[0].projectId).toBe(91));
    const request = http.expectOne(r => r.url.endsWith("/projects/selection/"));
    expect(request.request.params.get("evaluation")).toBe("not_evaluated");
    expect(request.request.params.get("case_name")).toBe("Экология");
    request.flush({ ids: [11], projects: [{ id: 11, project_id: 91 }] });
  });
  it("выбранная выгрузка использует POST Blob, удаление передает подписанное подтверждение без retry", () => {
    adapter.exportSelectedParticipants(4, [1, 21]).subscribe();
    const file = http.expectOne(r => r.url.endsWith("/participants/export/"));
    expect(file.request.method).toBe("POST");
    expect(file.request.body).toEqual({ ids: [1, 21] });
    expect(file.request.responseType).toBe("blob");
    file.flush(new Blob(["xlsx"]));
    adapter
      .previewParticipantRemoval(4, [1, 21])
      .subscribe(result => expect(result.previewToken).toBe("proof"));
    const preview = http.expectOne(r => r.url.endsWith("/remove-preview/"));
    preview.flush({ preview_token: "proof", participant_count: 2, applications: [] });
    const failed = vi.fn();
    adapter.removeParticipants(4, [1, 21], "proof").subscribe({ error: failed });
    const removal = http.expectOne(r => r.url.endsWith("/participants/remove/"));
    expect(removal.request.body).toEqual({ ids: [1, 21], preview_token: "proof" });
    removal.flush({ detail: "Изменено" }, { status: 409, statusText: "Conflict" });
    expect(failed).toHaveBeenCalledOnce();
    http.expectNone(r => r.url.endsWith("/participants/remove/"));
  });
  it("удаление материала передаёт версию в query и не вызывает удаление UserFile", () => {
    adapter
      .deleteMaterial(4, { id: 9, updatedAt: "2026-10-17T15:00:00+03:00" } as ManagementMaterial)
      .subscribe();
    const request = http.expectOne(r => r.url.endsWith("/programs/4/management/materials/9/"));
    expect(request.request.method).toBe("DELETE");
    expect(request.request.params.get("expected_updated_at")).toBe("2026-10-17T15:00:00+03:00");
    request.flush(null, { status: 204, statusText: "No Content" });
  });
});
