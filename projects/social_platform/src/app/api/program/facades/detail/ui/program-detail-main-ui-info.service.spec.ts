/** @format */

import { ProgramDetailMainUIInfoService } from "./program-detail-main-ui-info.service";
import { Program } from "@domain/program/program.model";

function createProgram(id: number, acknowledgedAt: string | null = null): Program {
  return {
    ...Program.default(),
    id,
    isUserMember: true,
    datetimeRegistrationEnds: "2099-01-01T00:00:00Z",
    welcomeAcknowledgedAt: acknowledgedAt,
  };
}

describe("ProgramDetailMainUIInfoService", () => {
  describe("independent deadlines", () => {
    const now = "2026-09-09T12:00:00Z";
    const past = "2026-09-01T00:00:00Z";
    const future = "2026-09-30T00:00:00Z";

    beforeEach(() => vi.spyOn(Date, "now").mockReturnValue(Date.parse(now)));
    afterEach(() => vi.restoreAllMocks());

    it.each([
      [past, future, true, false],
      [future, past, false, true],
      [past, now, true, false],
    ] as const)(
      "registration=%s, evaluation=%s are independent",
      (registration, evaluation, registrationExpired, evaluationExpired) => {
        const service = new ProgramDetailMainUIInfoService();
        service.applyFormatingProgramData({
          ...createProgram(1),
          datetimeRegistrationEnds: registration,
          datetimeEvaluationEnds: evaluation,
        });
        expect(service.registerDateExpired()).toBe(registrationExpired);
        expect(service.evaluationDateExpired()).toBe(evaluationExpired);
      },
    );

    it.each(["", undefined, "not-a-date"])(
      "does not close evaluation for legacy/invalid value %s",
      evaluation => {
        const service = new ProgramDetailMainUIInfoService();
        service.applyFormatingProgramData(
          Object.assign(createProgram(1), {
            datetimeRegistrationEnds: past,
            datetimeEvaluationEnds: evaluation,
          }),
        );
        expect(service.registerDateExpired()).toBe(true);
        expect(service.evaluationDateExpired()).toBe(false);
      },
    );

    it("recalculates closing and reopening from each fresh program response", () => {
      const service = new ProgramDetailMainUIInfoService();
      for (const [evaluation, expired] of [
        [past, true],
        [future, false],
        ["", false],
      ] as const) {
        service.applyFormatingProgramData({
          ...createProgram(1),
          datetimeEvaluationEnds: evaluation,
        });
        expect(service.evaluationDateExpired()).toBe(expired);
      }
    });
  });

  it("uses null as the required default current application", () => {
    expect(Program.default().currentProjectApplication).toBeNull();
  });

  it("показывает приветствие участнику до явного подтверждения", () => {
    const service = new ProgramDetailMainUIInfoService();

    service.applyFormatingProgramData(createProgram(1));

    expect(service.registeredProgramModal()).toBe(true);
  });

  it("не показывает подтверждённое приветствие на другом устройстве", () => {
    const service = new ProgramDetailMainUIInfoService();

    service.applyFormatingProgramData(createProgram(1, "2026-08-24T10:00:00Z"));

    expect(service.registeredProgramModal()).toBe(false);
  });

  it("не переносит подтверждение между программами", () => {
    const service = new ProgramDetailMainUIInfoService();
    service.applyFormatingProgramData(createProgram(1, "2026-08-24T10:00:00Z"));

    service.applyFormatingProgramData(createProgram(2));

    expect(service.registeredProgramModal()).toBe(true);
  });

  it("закрывает приветствие после ответа backend", () => {
    const service = new ProgramDetailMainUIInfoService();
    service.applyFormatingProgramData(createProgram(1));

    service.applyProgramWelcomeAcknowledged("2026-08-24T10:00:00Z");

    expect(service.registeredProgramModal()).toBe(false);
    expect(service.program()?.welcomeAcknowledgedAt).toBe("2026-08-24T10:00:00Z");
  });

  it("не открывает приветствие при повторном входе со свежим серверным timestamp", () => {
    const service = new ProgramDetailMainUIInfoService();
    const timestamp = "2026-09-07T10:00:00Z";
    service.applyFormatingProgramData(createProgram(7));
    expect(service.registeredProgramModal()).toBe(true);
    service.applyProgramWelcomeAcknowledged(timestamp);
    expect(service.registeredProgramModal()).toBe(false);

    service.applyFormatingProgramData({ ...Program.default(), id: 8 });
    service.applyFormatingProgramData(createProgram(7, timestamp));
    expect(service.registeredProgramModal()).toBe(false);
    expect(service.program()?.welcomeAcknowledgedAt).toBe(timestamp);
  });
});
