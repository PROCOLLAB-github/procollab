/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ok, fail } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionRegistrationRemovalPreview } from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionRegistrationRemovalUseCase,
  ApplySolutionRegistrationRemovalUseCase,
} from "@api/solution/use-cases/solution-registration-removal.use-cases";
import { SolutionRegistrationRemovalComponent } from "./solution-registration-removal.component";
const data = () =>
  structuredClone(
    solutionContractScenarios.find(
      s => s.operationId === "previewSolutionRegistrationRemoval" && s.status === 200,
    )!.response,
  ) as SolutionRegistrationRemovalPreview;
function setup() {
  const preview = { execute: vi.fn(() => of(ok(data()))) },
    apply = { execute: vi.fn(() => new Subject<ReturnType<typeof ok>>()) };
  TestBed.configureTestingModule({
    imports: [SolutionRegistrationRemovalComponent],
    providers: [
      { provide: PreviewSolutionRegistrationRemovalUseCase, useValue: preview },
      { provide: ApplySolutionRegistrationRemovalUseCase, useValue: apply },
    ],
  });
  const fixture = TestBed.createComponent(SolutionRegistrationRemovalComponent);
  fixture.componentRef.setInput("request", { programId: 12, ids: [91, 92] });
  fixture.detectChanges();
  return { fixture, c: fixture.componentInstance, preview, apply };
}
describe("Confirmed solution registration removal", () => {
  it("applies the reviewed registrations/token once and blocks closing while writing", () => {
    const { c, preview, apply } = setup();
    const closed = vi.fn();
    c.closed.subscribe(closed);
    const token = c.preview()!.previewToken;
    expect(preview.execute).toHaveBeenCalledExactlyOnceWith(12, { registrationIds: [91, 92] });
    c.confirm();
    c.confirm();
    c.close();
    expect(apply.execute).toHaveBeenCalledExactlyOnceWith(12, {
      registrationIds: [91, 92],
      previewToken: token,
    });
    expect(closed).not.toHaveBeenCalled();
  });
  it("drops a stale token when the selection changes", () => {
    const { fixture, c, preview, apply } = setup();
    const old = new Subject<ReturnType<typeof ok<SolutionRegistrationRemovalPreview>>>();
    preview.execute.mockReturnValueOnce(old).mockReturnValue(new Subject());
    c.load();
    fixture.componentRef.setInput("request", { programId: 13, ids: [111] });
    fixture.detectChanges();
    old.next(ok(data()));
    old.complete();
    expect(c.preview()).toBeNull();
    c.confirm();
    expect(apply.execute).not.toHaveBeenCalled();
  });
  it("invalidates a rejected preview and requires a fresh review before another apply", () => {
    const { c, apply } = setup();
    apply.execute.mockReturnValue(
      of(fail({ code: "selection_changed", detail: "Выбор изменился", errors: [], meta: {} })),
    );
    c.confirm();
    c.confirm();
    expect(c.preview()).toBeNull();
    expect(c.error()).toBe("Выбор изменился");
    expect(apply.execute).toHaveBeenCalledTimes(1);
  });
});
