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
  it("uses null as the required default current application", () => {
    expect(Program.default().currentApplication).toBeNull();
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
