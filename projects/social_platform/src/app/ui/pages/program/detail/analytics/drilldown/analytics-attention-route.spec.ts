/** @format */
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { BehaviorSubject, firstValueFrom, of, Subject } from "rxjs";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import { ProgramAnalyticsDrilldownService } from "@api/program/facades/detail/program-analytics-drilldown.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import {
  participantsPage,
  projectsPage,
} from "@domain/program/program-analytics-attention.fixture";
import { Program } from "@domain/program/program.model";
import { ok } from "@domain/shared/result.type";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { AnalyticsDrilldownComponent } from "./analytics-drilldown.component";

@Component({
  imports: [AnalyticsDrilldownComponent],
  providers: [ProgramAnalyticsInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
      #trigger
      (click)="drilldown.openAttention('participants-without-team', trigger)"
    >
      Участники без команды</button
    ><app-analytics-drilldown #drilldown [programId]="analytics.programId()" />`,
})
class RouteHost {
  readonly analytics = inject(ProgramAnalyticsInfoService);
  constructor() {
    this.analytics.initialize();
  }
}

describe("Attention SPA: observable route → resolver → overview", () => {
  it.each(["participants-without-team", "projects-awaiting-evaluation"] as const)(
    "%s отменяется до Program(13), без нового auto request",
    async view => {
      const params = new BehaviorSubject(convertToParamMap({ programId: "12" }));
      const old = new Subject();
      const attention = { execute: vi.fn().mockReturnValue(old) };
      const overview = { execute: vi.fn().mockReturnValue(of(ok({}))) };
      await TestBed.configureTestingModule({
        imports: [RouteHost],
        providers: [
          provideRouter([]),
          ProgramDetailMainUIInfoService,
          { provide: ActivatedRoute, useValue: { parent: { paramMap: params.asObservable() } } },
          { provide: GetProgramManagerOverviewUseCase, useValue: overview },
          { provide: GetProgramManagerParticipantsWithoutTeamUseCase, useValue: attention },
          { provide: GetProgramManagerProjectsAwaitingEvaluationUseCase, useValue: attention },
          { provide: GetProgramManagerAssignmentsUseCase, useValue: { execute: vi.fn() } },
          { provide: GetProgramManagerAssignmentScoresUseCase, useValue: { execute: vi.fn() } },
        ],
      }).compileComponents();
      const ui = TestBed.inject(ProgramDetailMainUIInfoService);
      ui.program.set({ ...Program.default(), id: 12, isUserManager: true });
      const fixture = TestBed.createComponent(RouteHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const child = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent));
      const component = child.componentInstance as AnalyticsDrilldownComponent;
      const state = child.injector.get(ProgramAnalyticsDrilldownService);
      const modal = child.query(By.directive(ModalComponent)).componentInstance as ModalComponent;
      const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
      const attached = firstValueFrom(modal.overlayRef!.attachments());
      component.openAttention(view, trigger);
      await attached;
      await fixture.whenStable();
      old.next(ok(view === "participants-without-team" ? participantsPage() : projectsPage()));
      await fixture.whenStable();
      expect(old.observed).toBe(true);
      expect(state.attentionPage()?.count).toBe(1);
      const focus = vi.spyOn(trigger, "focus");

      // Router emits parent params before resolver installs a new Program. No snapshot mutations.
      params.next(convertToParamMap({ programId: "13" }));
      expect(fixture.componentInstance.analytics.programId()).toBeNull();
      expect(ui.program()?.id).toBe(12);
      // Let the normal Angular interaction render propagate the signal input; no detectChanges hack.
      await fixture.whenStable();
      expect(old.observed).toBe(false);
      expect(state.open()).toBe(false);
      expect(state.attentionPage()).toBeNull();
      expect(attention.execute).toHaveBeenCalledExactlyOnceWith(12, {
        search: "",
        limit: 25,
        offset: 0,
      });
      expect(overview.execute).toHaveBeenCalledExactlyOnceWith(12);

      ui.program.set({ ...Program.default(), id: 13, isUserManager: true });
      await fixture.whenStable();
      expect(overview.execute).toHaveBeenCalledTimes(2);
      expect(overview.execute).toHaveBeenLastCalledWith(13);
      expect(attention.execute).toHaveBeenCalledTimes(1);
      old.next(ok(participantsPage({ count: 999 })));
      await fixture.whenStable();
      expect(state.attentionPage()).toBeNull();
      expect(focus).not.toHaveBeenCalled();
      fixture.destroy();
    },
  );
});
