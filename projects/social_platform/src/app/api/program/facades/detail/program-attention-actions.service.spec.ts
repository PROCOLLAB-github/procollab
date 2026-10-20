/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramAttentionActionsUseCase } from "@api/program/use-cases/program-attention-actions.use-case";
import { ProgramAnalyticsDrilldownService } from "./program-analytics-drilldown.service";
import {
  participantsPage,
  attentionParticipant,
} from "@domain/program/program-analytics-attention.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { ProgramAttentionPreview } from "@domain/program/program-attention-actions.model";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
import { saveAs } from "file-saver";

const preview: ProgramAttentionPreview = {
  token: "signed-preview",
  selectedCount: 1,
  recipientCount: 1,
  withoutAssignmentsCount: 0,
  unavailableCount: 0,
  previewText: "Анна, здравствуйте!",
  expiresIn: 900,
  recipients: [{ userId: 123, fullName: "Анна" }],
};

describe("Attention bulk actions", () => {
  let state: ProgramAnalyticsDrilldownService;
  const actions = { preview: vi.fn(), send: vi.fn(), export: vi.fn() };
  const repo = { getManagerParticipantsWithoutTeam: vi.fn(), getCaseProjects: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    repo.getManagerParticipantsWithoutTeam.mockReturnValue(of(participantsPage({ count: 51 })));
    actions.preview.mockReturnValue(of(ok(preview)));
    actions.send.mockReturnValue(of(ok({ createdCount: 1, skippedCount: 0 })));
    actions.export.mockReturnValue(of(ok(new Blob(["xlsx"]))));
    TestBed.configureTestingModule({
      providers: [
        ProgramAnalyticsDrilldownService,
        { provide: ProgramRepositoryPort, useValue: repo },
        { provide: ProgramAttentionActionsUseCase, useValue: actions },
      ],
    });
    state = TestBed.inject(ProgramAnalyticsDrilldownService);
    state.openAttention(12, "participants-without-team");
  });

  it("selects all matching pages with exclusions and preserves explicit row selection on pagination", () => {
    state.selectAllFound();
    expect(state.selectedCount()).toBe(51);
    state.toggleSelection(123);
    expect(state.selectedCount()).toBe(50);
    state.changeAttentionPage(1);
    expect(state.isSelected(124)).toBe(true);
    expect(state.isSelected(123)).toBe(false);
    state.previewReminder();
    expect(actions.preview).toHaveBeenCalledWith(12, "participants-without-team", {
      search: "",
      selection: { mode: "all", ids: [], excludedIds: [123] },
    });
  });

  it("resets selection and preview when applying search", () => {
    state.toggleSelection(123);
    state.previewReminder();
    expect(state.preview()).toEqual(preview);
    state.searchDraft.set("  Анна  ");
    state.applyAttentionSearch();
    expect(state.selectedCount()).toBe(0);
    expect(state.preview()).toBeNull();
    expect(state.appliedSearch()).toBe("Анна");
  });

  it("does not send during preview and uses the exact reviewed token", () => {
    state.toggleSelection(123);
    state.previewReminder();
    expect(actions.send).not.toHaveBeenCalled();
    state.sendReminder();
    expect(actions.send).toHaveBeenCalledExactlyOnceWith(
      12,
      "participants-without-team",
      "signed-preview",
    );
    expect(state.actionSuccess()).toContain("Напоминания созданы: 1");
    expect(state.selectedCount()).toBe(0);
    state.sendReminder();
    expect(actions.send).toHaveBeenCalledTimes(1);
  });

  it("disables duplicate submissions and keeps selection stable while sending", () => {
    const pending = new Subject<any>();
    actions.send.mockReturnValue(pending);
    state.toggleSelection(123);
    state.previewReminder();
    state.sendReminder();
    state.sendReminder();
    state.toggleSelection(124);
    state.clearSelection();
    expect(actions.send).toHaveBeenCalledTimes(1);
    expect(state.selectedCount()).toBe(1);
    expect(state.actionPending()).toBe("send");
    pending.next(ok({ createdCount: 1, skippedCount: 0 }));
    expect(state.actionPending()).toBeNull();
  });

  it("keeps reviewed token after a network error for an idempotent retry", () => {
    state.toggleSelection(123);
    state.previewReminder();
    actions.send.mockReturnValue(of(fail({ kind: "network" })));
    state.sendReminder();
    expect(state.preview()?.token).toBe("signed-preview");
    actions.send.mockReturnValue(of(ok({ createdCount: 1, skippedCount: 0 })));
    state.sendReminder();
    expect(actions.send.mock.calls.map(call => call[2])).toEqual([
      "signed-preview",
      "signed-preview",
    ]);
  });

  it("expired previews require reviewing recipients again", () => {
    state.toggleSelection(123);
    state.previewReminder();
    actions.send.mockReturnValue(of(fail({ kind: "validation" })));
    state.sendReminder();
    expect(state.preview()).toBeNull();
    expect(state.actionError()).toContain("устарел");
    expect(state.selectedCount()).toBe(1);
  });

  it("no recipient means export remains available and sending is blocked", () => {
    state.toggleSelection(123);
    actions.preview.mockReturnValue(
      of(ok({ ...preview, token: null, recipientCount: 0, recipients: [] })),
    );
    state.previewReminder();
    state.sendReminder();
    expect(actions.send).not.toHaveBeenCalled();
    state.exportAttention();
    expect(actions.export).toHaveBeenCalled();
  });

  it("exports all found without selection and only selected when rows are checked", () => {
    state.exportAttention();
    expect(actions.export).toHaveBeenLastCalledWith(12, "participants-without-team", {
      search: "",
      selection: { mode: "all", ids: [], excludedIds: [] },
    });
    state.toggleSelection(123);
    state.exportAttention();
    expect(actions.export).toHaveBeenLastCalledWith(12, "participants-without-team", {
      search: "",
      selection: { mode: "selected", ids: [123], excludedIds: [] },
    });
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      "Требует внимания-participants-without-team-12.xlsx",
    );
  });

  it("late responses after closing cannot affect a different program", () => {
    const pending = new Subject<any>();
    actions.preview.mockReturnValue(pending);
    state.toggleSelection(123);
    state.previewReminder();
    state.close();
    state.openAttention(24, "participants-without-team");
    pending.next(ok(preview));
    expect(state.preview()).toBeNull();
    expect(state.selectedCount()).toBe(0);
  });

  it("list failure disables reminder and export actions", () => {
    state.toggleSelection(123);
    state.attentionError.set({ kind: "forbidden" });
    state.previewReminder();
    state.exportAttention();
    expect(actions.preview).not.toHaveBeenCalled();
    expect(actions.export).not.toHaveBeenCalled();
  });

  it("clear selection also clears validation and success messages", () => {
    state.selectAllFound();
    state.actionSuccess.set("done");
    state.clearSelection();
    expect(state.selectedCount()).toBe(0);
    expect(state.actionSuccess()).toBe("");
    expect(state.isSelected(attentionParticipant().userId)).toBe(false);
  });
});
