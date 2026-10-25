/** @format */
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { CertificateDraft, CertificateSettings } from "@domain/program/program-certificates.model";
import { ManagementCertificatesComponent } from "./certificates.component";
import { CertificateCanvasComponent } from "./certificate-canvas.component";
const keys = [
  "title",
  "subtitle",
  "name",
  "program",
  "date",
  "number",
  "director",
  "position",
  "signature",
];
function settings(): CertificateSettings {
  return {
    revision: 1,
    draft: {
      backgroundId: null,
      signatureId: null,
      director: "",
      position: "",
      showText: true,
      audience: "submitted",
      timing: "manual",
      scheduledAt: null,
      sendEmail: true,
      subject: "Сертификат {program}",
      message: "Здравствуйте, {name}!",
      layout: Object.fromEntries(
        keys.map(key => [key, { x: 10, y: 20, width: 60, height: 10, fontSize: 18 }]),
      ) as CertificateDraft["layout"],
    },
    assets: { background: null, signature: null },
    eligibleCounts: { all: 5, submitted: 2 },
    batch: null,
  };
}
async function setup(data = settings()) {
  const repository = {
    settings: vi.fn(() => of(data)),
    save: vi.fn((_id: number, revision: number, draft: CertificateDraft) =>
      of({ ...data, revision: revision + 1, draft }),
    ),
    journal: vi.fn(() =>
      of({ count: 0, results: [], summary: { total: 0, ready: 0, sent: 0, failed: 0 } }),
    ),
    retry: vi.fn(() => of({ count: 1 })),
    preview: vi.fn(() => of(new Blob(["%PDF"]))),
    test: vi.fn(() => of({ detail: "Письмо поставлено в очередь" })),
    asset: vi.fn(),
    upload: vi.fn(),
    activate: vi.fn(() => of({ ...data, revision: 2 })),
    queue: vi.fn(),
    pdf: vi.fn(),
    currentPdf: vi.fn(() => of(new Blob(["%PDF"]))),
    selection: vi.fn(() => of({ count: 1, skipped: 0 })),
    archive: vi.fn(),
    currentArchive: vi.fn(() => of(new Blob(["zip"]))),
    mine: vi.fn(),
  };
  TestBed.configureTestingModule({ imports: [ManagementCertificatesComponent] });
  TestBed.overrideComponent(ManagementCertificatesComponent, {
    set: {
      providers: [
        ProgramCertificatesUseCase,
        { provide: ProgramCertificatesRepositoryPort, useValue: repository },
      ],
    },
  });
  const fixture = TestBed.createComponent(ManagementCertificatesComponent);
  fixture.componentRef.setInput("programId", 9);
  fixture.componentRef.setInput("programName", "Моя программа");
  fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(true));
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, repository };
}
describe("Program certificates", () => {
  it("applies a typed font size immediately, grows the old short box and supports undo", async () => {
    const data = settings();
    data.draft.layout.name.height = 2;
    const { fixture, component } = await setup(data);
    const input = fixture.nativeElement.querySelector(".canvas__font input") as HTMLInputElement;
    input.value = "48";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(component.draft()!.layout.name.fontSize).toBe(48);
    expect(component.draft()!.layout.name.height).toBeGreaterThan(2);
    const canvas = fixture.debugElement.query(By.directive(CertificateCanvasComponent))
      .componentInstance as CertificateCanvasComponent;
    expect(canvas.fits().name.fontSize).toBeCloseTo(48, 2);
    expect(fixture.nativeElement.querySelector(".canvas__zoom")).toBeNull();
    component.undo();
    expect(component.draft()!.layout.name.height).toBe(2);
    expect(component.draft()!.layout.name.fontSize).toBe(18);
    fixture.destroy();
  });
  it("uses the long-name preview flag for the downloaded PDF", async () => {
    const { fixture, component, repository } = await setup();
    component.longName.set(true);
    await component.preview();
    expect(repository.preview).toHaveBeenCalledWith(9, 1, true);
    fixture.destroy();
  });
  it("selects every matching recipient across pages, allows exclusions and clears on filter change", async () => {
    const { fixture, component, repository } = await setup();
    component.journal.set({
      count: 128,
      results: [],
      summary: { total: 128, ready: 128, sent: 2, failed: 1 },
    });
    component.selectAll(true);
    component.toggleRow("excluded-id", false);
    expect(component.selectedCount()).toBe(127);
    expect(component.allChecked()).toBe(false);
    expect(component.isSelected("next-page-id")).toBe(true);
    component.selectionAction.set("send");
    await component.performSelection();
    expect(repository.selection).toHaveBeenCalledWith(9, 1, "send", {
      allMatching: true,
      excludedIds: ["excluded-id"],
      status: "all",
      search: "",
    });
    expect(component.selectedCount()).toBe(0);
    component.toggleRow("one-id", true);
    component.setFilter("failed");
    expect(component.selectedCount()).toBe(0);
    fixture.destroy();
  });
  it("saves changes before downloading a participant PDF and uses the current template endpoint", async () => {
    const { fixture, component, repository } = await setup();
    component.patch({ director: "Новый директор" });
    await component.pdf("certificate-id");
    expect(repository.save).toHaveBeenCalled();
    expect(repository.currentPdf).toHaveBeenCalledWith(9, "certificate-id", 2);
    expect(repository.pdf).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it("keeps selection on a rejected action and exposes the failure in its confirmation", async () => {
    const { fixture, component, repository } = await setup();
    component.toggleRow("one-id", true);
    component.selectionAction.set("refresh");
    repository.selection.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { detail: "Настройки изменены" } }),
      ),
    );
    await component.performSelection();
    expect(component.selectedCount()).toBe(1);
    expect(component.selectionAction()).toBe("refresh");
    expect(component.error()).toContain("Настройки изменены");
    fixture.destroy();
  });
  it("shows an actionable API error when a PDF request returns a JSON blob", async () => {
    const { fixture, component, repository } = await setup();
    const text = JSON.stringify({ detail: "Дождитесь завершения обработки." });
    const error = Object.assign(new Blob([text], { type: "application/json" }), {
      text: async () => text,
    });
    repository.currentPdf.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error })),
    );
    await component.pdf("certificate-id");
    expect(component.error()).toBe("Дождитесь завершения обработки.");
    fixture.destroy();
  });
  it.each([
    { pdfReady: false, label: "PDF не создан", sentAt: null },
    { pdfReady: true, label: "PDF не обновлен", sentAt: null },
    { pdfReady: true, label: "PDF не обновлен", sentAt: "2026-10-24T10:00:00Z" },
  ])(
    "distinguishes a failed PDF generation/update from a mail failure ($pdfReady)",
    async ({ pdfReady, label, sentAt }) => {
      const { fixture, component } = await setup();
      component.step.set(3);
      component.journal.set({
        count: 1,
        summary: { total: 1, ready: Number(pdfReady), sent: 0, failed: 1 },
        results: [
          {
            id: "failed-id",
            name: "Тестовый участник",
            email: "test@example.test",
            status: "failed",
            pdfReady,
            pdfError: true,
            error: "Не удалось создать PDF или отправить письмо.",
            sentAt,
          },
        ],
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('td[data-label="Письмо"]').textContent).toContain(
        sentAt ? "Отправлено" : "Не отправлено",
      );
      const pdf = fixture.nativeElement.querySelector('td[data-label="Сертификат"]').textContent;
      expect(pdf).toContain(label);
      expect(pdf).not.toContain("Готовится");
      fixture.destroy();
    },
  );
  it("changes only the selected element font with history, saves it and keeps geometry", async () => {
    const { fixture, component, repository } = await setup();
    const initial = structuredClone(component.draft()!.layout);
    const select = fixture.nativeElement.querySelector(
      ".canvas__family select",
    ) as HTMLSelectElement;
    expect(select.value).toBe("mont");
    select.value = "pt-serif";
    select.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(component.draft()!.layout.name).toEqual({ ...initial.name, fontFamily: "pt-serif" });
    expect(component.draft()!.layout.director).toEqual(initial.director);
    expect(fixture.nativeElement.querySelector(".canvas__element").style.fontFamily).toContain(
      "Certificate PT Serif",
    );
    component.undo();
    expect(component.draft()!.layout).toEqual(initial);
    component.redo();
    expect(component.draft()!.layout.name.fontFamily).toBe("pt-serif");
    await component.save();
    expect(repository.save).toHaveBeenCalledWith(
      9,
      1,
      expect.objectContaining({
        layout: expect.objectContaining({
          name: expect.objectContaining({ fontFamily: "pt-serif" }),
        }),
      }),
    );
    expect(component.dirty()).toBe(false);
    fixture.destroy();
  });
  it("preserves the saved font while centering, and blocks font changes for images and preview", async () => {
    const data = settings();
    data.draft.layout.name.fontFamily = "lobster";
    const { fixture, component } = await setup(data);
    expect(
      (fixture.nativeElement.querySelector(".canvas__family select") as HTMLSelectElement).value,
    ).toBe("lobster");
    const canvas = fixture.debugElement.query(By.directive(CertificateCanvasComponent))
      .componentInstance as CertificateCanvasComponent;
    canvas.center();
    fixture.detectChanges();
    expect(component.draft()!.layout.name.fontFamily).toBe("lobster");
    expect(canvas.fontWeight("name")).toBe(400);
    component.selected.set("signature");
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".canvas__family select") as HTMLSelectElement).disabled,
    ).toBe(true);
    canvas.familyChanged("pt-serif");
    expect(component.draft()!.layout.signature.fontFamily).toBeUndefined();
    component.selected.set("name");
    component.editorPreview.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    canvas.familyChanged("pt-serif");
    expect(component.draft()!.layout.name.fontFamily).toBe("lobster");
    fixture.destroy();
  });
  it("defaults legacy templates to landscape and saves portrait with undo and redo", async () => {
    const { fixture, component, repository } = await setup();
    expect(component.draft()!.orientation).toBe("landscape");
    expect(component.dirty()).toBe(false);
    component.setOrientation("portrait");
    fixture.detectChanges();
    expect(component.formatLabel()).toContain("210 × 297");
    expect(fixture.nativeElement.querySelector(".canvas").style.aspectRatio).toBe("210 / 297");
    component.undo();
    expect(component.draft()!.orientation).toBe("landscape");
    component.redo();
    expect(component.draft()!.orientation).toBe("portrait");
    await component.save();
    expect(repository.save).toHaveBeenCalledWith(
      9,
      1,
      expect.objectContaining({ orientation: "portrait" }),
    );
    expect(component.dirty()).toBe(false);
    fixture.destroy();
  });
  it("chooses orientation from a portrait background and undoes the file and orientation together", async () => {
    const { fixture, component, repository } = await setup();
    repository.upload.mockReturnValue(
      of({ id: 12, name: "portrait.png", width: 2480, height: 3508 }),
    );
    repository.asset.mockReturnValue(of(new Blob(["image"])));
    await component.upload(
      { target: { files: [new File(["image"], "portrait.png")] } } as unknown as Event,
      "background",
    );
    expect(component.draft()!.orientation).toBe("portrait");
    expect(component.draft()!.backgroundId).toBe(12);
    component.undo();
    expect(component.draft()!.orientation).toBe("landscape");
    expect(component.draft()!.backgroundId).toBeNull();
    component.redo();
    expect(component.draft()!.orientation).toBe("portrait");
    fixture.destroy();
  });
  it("allows only the name to remain, restores removed elements and preserves geometry", async () => {
    const { fixture, component } = await setup();
    const layout = structuredClone(component.draft()!.layout);
    component.onlyName();
    fixture.detectChanges();
    expect(component.visibleElements()).toEqual(["name"]);
    expect(fixture.nativeElement.querySelector('[aria-label="Удалить: Имя участника"]')).toBeNull();
    component.hideElement("name");
    expect(component.visibleElements()).toEqual(["name"]);
    component.addElement("date");
    expect(component.visibleElements()).toContain("date");
    expect(component.draft()!.layout).toEqual(layout);
    component.undo();
    expect(component.visibleElements()).toEqual(["name"]);
    component.redo();
    expect(component.visibleElements()).toContain("date");
    fixture.destroy();
  });
  it("normalizes legacy paired headings without changing saved placement or making the form dirty", async () => {
    const data = settings();
    data.draft.showText = false;
    const { fixture, component } = await setup(data);
    expect(component.hiddenElements()).toEqual(["title", "subtitle"]);
    expect(component.draft()!.layout).toEqual(data.draft.layout);
    expect(component.dirty()).toBe(false);
    component.addElement("title");
    expect(component.hiddenElements()).toEqual(["subtitle"]);
    fixture.destroy();
  });
  it("fits an uploaded signature inside its existing area and undoes both file and layout", async () => {
    const { fixture, component, repository } = await setup();
    const initial = structuredClone(component.draft()!.layout.signature);
    repository.upload.mockReturnValue(
      of({ id: 11, name: "signature.png", width: 600, height: 200 }),
    );
    repository.asset.mockReturnValue(of(new Blob(["image"])));
    const input = document.createElement("input");
    Object.defineProperty(input, "files", { value: [new File(["image"], "signature.png")] });
    await component.upload({ target: input } as unknown as Event, "signature");
    const box = component.draft()!.layout.signature;
    expect(box.width).toBeLessThanOrEqual(initial.width);
    expect(box.height).toBeLessThanOrEqual(initial.height);
    expect((box.width * (297 / 210)) / box.height).toBeCloseTo(3);
    expect(component.draft()!.signatureId).toBe(11);
    component.undo();
    expect(component.draft()!.layout.signature).toEqual(initial);
    expect(component.assets().signature).toBeNull();
    expect(component.draft()!.signatureId).toBeNull();
    fixture.destroy();
  });
  it("saves changes before opening a separate launch confirmation and never activates early", async () => {
    const { fixture, component, repository } = await setup();
    component.patch({ sendEmail: false });
    await component.prepareLaunch();
    expect(repository.save).toHaveBeenCalledWith(
      9,
      1,
      expect.objectContaining({ sendEmail: false }),
    );
    expect(component.dirty()).toBe(false);
    expect(component.confirmOpen()).toBe(true);
    expect(repository.activate).not.toHaveBeenCalled();
    await component.activate();
    expect(repository.activate).toHaveBeenCalledWith(9, 2);
    fixture.destroy();
  });
  it.each([400, 409, 500, 0])(
    "keeps the draft and blocks dependent actions if saving fails (%s)",
    async status => {
      const { fixture, component, repository } = await setup();
      repository.save.mockReturnValue(
        throwError(() => ({
          status,
          error: { detail: "Настройки изменены другим организатором." },
        })),
      );
      component.patch({ director: "Несохраненное имя" });
      await component.prepareLaunch();
      expect(component.confirmOpen()).toBe(false);
      expect(component.draft()!.director).toBe("Несохраненное имя");
      expect(component.dirty()).toBe(true);
      expect(component.error()).toBeTruthy();
      expect(repository.activate).not.toHaveBeenCalled();
      expect(component.busy()).toBe(false);
      await component.preview();
      await component.test();
      expect(repository.preview).not.toHaveBeenCalled();
      expect(repository.test).not.toHaveBeenCalled();
      fixture.destroy();
    },
  );
  it("shows an activation failure inside the open confirmation and allows retry", async () => {
    const { fixture, component, repository } = await setup();
    await component.prepareLaunch();
    fixture.detectChanges();
    await fixture.whenStable();
    repository.activate.mockReturnValueOnce(
      throwError(() => ({ status: 500, error: { detail: "Не удалось запустить выдачу." } })),
    );
    await component.activate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.confirmOpen()).toBe(true);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(
        document.querySelector('.certificates__confirmation [role="alert"]')?.textContent,
      ).toContain("Попробуйте еще раз");
    });
    await component.activate();
    expect(component.confirmOpen()).toBe(false);
    expect(component.step()).toBe(3);
    fixture.destroy();
  });
  it("shows a next action for an active batch without changing its template", async () => {
    const data = settings();
    data.batch = { id: 1, active: true, issueAt: new Date().toISOString(), initializedAt: null };
    const { fixture, component, repository } = await setup(data);
    await component.prepareLaunch();
    expect(component.step()).toBe(3);
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.activate).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it("keeps legacy visibility clean on queue changes and preserves any unsaved edits", async () => {
    const data = settings();
    data.draft.showText = false;
    const { fixture, component, repository } = await setup(data);
    repository.queue.mockReturnValue(of(data));
    await component.queue();
    expect(component.dirty()).toBe(false);
    component.patch({ director: "Несохраненный директор" });
    await component.queue();
    expect(component.draft()!.director).toBe("Несохраненный директор");
    expect(component.dirty()).toBe(true);
    fixture.destroy();
  });
  it("explains zero recipients and an issue date before program completion", async () => {
    const data = settings();
    data.eligibleCounts = { all: 0, submitted: 0 };
    const { fixture, component, repository } = await setup(data);
    expect(component.launchProblem()).toContain("нет участников");
    await component.prepareLaunch();
    expect(repository.activate).not.toHaveBeenCalled();
    component.snapshot.update(v => ({ ...v!, eligibleCounts: { all: 5, submitted: 2 } }));
    fixture.componentRef.setInput("finishedAt", new Date(Date.now() + 86400000 * 3).toISOString());
    component.patch({
      timing: "scheduled",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(component.launchProblem()).toContain("раньше окончания");
    component.setStep(2);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("#certificate-schedule-error")?.textContent,
    ).toContain("раньше окончания");
    expect(
      fixture.nativeElement
        .querySelector('input[type="datetime-local"]')
        ?.getAttribute("aria-invalid"),
    ).toBe("true");
    await component.prepareLaunch();
    expect(repository.save).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it("loads a real program and shows no invented participants or email prerequisite", async () => {
    const { fixture, component, repository } = await setup();
    expect(repository.settings).toHaveBeenCalledWith(9);
    expect(component.recipients()).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain("подтверждения почты");
    expect(fixture.nativeElement.textContent).not.toContain("Включено");
    fixture.destroy();
  });
  it("tracks drag/form changes for the parent navigation guard and discards them", async () => {
    const { fixture, component } = await setup();
    const emit = vi.spyOn(component.statusChange, "emit");
    component.patch({ director: "Новый директор" });
    fixture.detectChanges();
    expect(component.dirty()).toBe(true);
    expect(emit).toHaveBeenCalledWith({ dirty: true, busy: false });
    component.discard();
    fixture.detectChanges();
    expect(component.dirty()).toBe(false);
    fixture.destroy();
  });
  it("requests only failed deliveries and resets page when switching filters", async () => {
    const { fixture, component, repository } = await setup();
    component.offset.set(40);
    component.search.set("Крылова");
    component.setFilter("failed");
    await fixture.whenStable();
    expect(repository.journal).toHaveBeenLastCalledWith(9, "failed", "Крылова", 0);
    fixture.destroy();
  });
  it("ignores a slower response from a previously selected filter", async () => {
    const { fixture, component, repository } = await setup();
    const old = new Subject<any>(),
      current = new Subject<any>();
    repository.journal.mockReturnValueOnce(old).mockReturnValueOnce(current);
    component.setFilter("all");
    component.setFilter("failed");
    const data = { count: 1, results: [], summary: { total: 2, ready: 2, sent: 1, failed: 1 } };
    current.next(data);
    current.complete();
    await fixture.whenStable();
    old.next({ ...data, count: 2 });
    old.complete();
    await fixture.whenStable();
    expect(component.journal()?.count).toBe(1);
    fixture.destroy();
  });
  it("retries a single selected error using the current template and preserving delivery mode", async () => {
    const { fixture, component, repository } = await setup();
    component.selectFailed("certificate-id");
    expect(component.selectionCopy().hint).toContain("Способ доставки сохраняется");
    await component.performSelection();
    expect(repository.selection).toHaveBeenCalledWith(9, 1, "retry", { ids: ["certificate-id"] });
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.activate).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
