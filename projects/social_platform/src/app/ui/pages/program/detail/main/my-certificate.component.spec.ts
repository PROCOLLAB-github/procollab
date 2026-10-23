/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { MyCertificateComponent } from "./my-certificate.component";

function setup(mine = vi.fn(() => of([] as { id: string; issuedAt: string; url: string }[]))) {
  TestBed.configureTestingModule({ imports: [MyCertificateComponent] });
  TestBed.overrideComponent(MyCertificateComponent, {
    set: { providers: [{ provide: ProgramCertificatesUseCase, useValue: { mine } }] },
  });
  const fixture = TestBed.createComponent(MyCertificateComponent);
  fixture.componentRef.setInput("programId", 12);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mine };
}
describe("Participant certificate", () => {
  it("shows only the own download returned by API", () => {
    const row = {
      id: "own",
      issuedAt: "2026-10-24",
      url: "https://dev.procollab.ru/programs/12/certificates/download/own/",
    };
    const { fixture, mine } = setup(vi.fn(() => of([row])));
    fixture.detectChanges();
    expect(mine).toHaveBeenCalledExactlyOnceWith(12);
    expect(fixture.nativeElement.querySelector("a").href).toBe(row.url);
    fixture.destroy();
  });
  it("hides an empty state when no certificate has been issued", () => {
    const empty = setup();
    empty.fixture.detectChanges();
    expect(empty.fixture.nativeElement.querySelector("section")).toBeNull();
    empty.fixture.destroy();
  });
  it("never displays a late certificate from the previously opened program", () => {
    const old = new Subject<any[]>(),
      current = new Subject<any[]>();
    const mine = vi.fn().mockReturnValueOnce(old).mockReturnValueOnce(current);
    const { fixture, component } = setup(mine);
    fixture.componentRef.setInput("programId", 13);
    fixture.detectChanges();
    old.next([{ id: "old", url: "https://example.com/old" }]);
    old.complete();
    current.next([]);
    current.complete();
    fixture.detectChanges();
    expect(component.url()).toBeNull();
    expect(fixture.nativeElement.querySelector("a")).toBeNull();
    fixture.destroy();
  });
  it("offers a retry after a failed request without displaying a stale link", () => {
    const { fixture, component, mine } = setup(
      vi
        .fn()
        .mockReturnValueOnce(throwError(() => new Error("offline")))
        .mockReturnValueOnce(of([])),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Не удалось проверить сертификат");
    component.load();
    fixture.detectChanges();
    expect(mine).toHaveBeenCalledTimes(2);
    expect(component.error()).toBe(false);
    fixture.destroy();
  });
});
