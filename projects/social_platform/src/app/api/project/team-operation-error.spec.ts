/** @format */
import { HttpErrorResponse } from "@angular/common/http";
import { teamOperationErrorMessage } from "./team-operation-error";
import { mapInviteSendError } from "@api/invite/mappers/map-invite-send-error";
import {
  mapProgramLinkFieldsError,
  programLinkFieldsErrorMessage,
} from "./program-link-fields-error";

describe("Typed team conflicts", () => {
  it("объясняет, почему нельзя сдать проект без настроенных кейсов", () => {
    const cause = new HttpErrorResponse({
      status: 400,
      error: { detail: "Организатор ещё не настроил кейсы или треки программы." },
    });
    const error = mapProgramLinkFieldsError(cause);
    expect(error.kind).toBe("cases_not_configured");
    expect(programLinkFieldsErrorMessage(error)).toBe(
      "Организатор еще не настроил кейсы или треки программы.",
    );
  });
  it.each([
    "team_frozen",
    "already_in_program_team",
    "team_min_size",
    "team_max_size",
    "program_context_required",
    "not_program_member",
    "invite_already_processed",
    "duplicate_pending_invite",
  ])("показывает безопасное сообщение %s в invite и submission", code => {
    const cause = new HttpErrorResponse({
      status: 409,
      error: { code, detail: "PRIVATE SERVER TEXT" },
    });
    const message = teamOperationErrorMessage(cause);
    expect(message).toBeTruthy();
    expect(message).not.toContain("PRIVATE");
    expect(mapInviteSendError(cause).message).toBe(message);
    expect(programLinkFieldsErrorMessage(mapProgramLinkFieldsError(cause))).toBe(message);
  });
  it("не выводит произвольный body или prototype key", () => {
    for (const code of ["unknown", "toString", "__proto__"]) {
      expect(
        teamOperationErrorMessage(
          new HttpErrorResponse({ status: 409, error: { code, detail: "PRIVATE" } }),
        ),
      ).toBeUndefined();
    }
  });
});
