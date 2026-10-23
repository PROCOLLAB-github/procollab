/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { CertificateDraft, CertificateSettings } from "@domain/program/program-certificates.model";
import { ManagementCertificatesComponent } from "./certificates.component";
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
async function setup() {
  const data = settings();
  const repository = {
    settings: vi.fn(() => of(data)),
    save: vi.fn(() => of({ ...data, revision: 2 })),
    journal: vi.fn(() =>
      of({ count: 0, results: [], summary: { total: 0, ready: 0, sent: 0, failed: 0 } }),
    ),
    retry: vi.fn(() => of({ count: 1 })),
    preview: vi.fn(),
    test: vi.fn(),
    asset: vi.fn(),
    upload: vi.fn(),
    activate: vi.fn(),
    queue: vi.fn(),
    pdf: vi.fn(),
    archive: vi.fn(),
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
  it("retries a single selected error without resubmitting the template", async () => {
    const { fixture, component, repository } = await setup();
    await component.retry("certificate-id");
    expect(repository.retry).toHaveBeenCalledWith(9, ["certificate-id"]);
    expect(repository.activate).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
