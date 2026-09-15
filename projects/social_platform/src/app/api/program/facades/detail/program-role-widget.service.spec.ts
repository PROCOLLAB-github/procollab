/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { GetProgramRoleWidgetUseCase } from "../../use-cases/get-program-role-widget.use-case";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";
import { ProgramRoleWidgetService } from "./program-role-widget.service";
import { Program } from "@domain/program/program.model";
import { ProgramRoleWidget, ProgramWidgetError } from "@domain/program/program-role-widget.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { EventBus } from "@domain/shared/event-bus";

describe("ProgramRoleWidgetService", () => {
  let service: ProgramRoleWidgetService;
  const profile = signal<{ id: number } | null>({ id: 7 });
  const program = signal(Object.assign(Program.default(), { id: 12, isUserMember: true }));
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let responses: Subject<Result<ProgramRoleWidget, ProgramWidgetError>>[];
  const result = (id = 12): ProgramRoleWidget => ({
    programId: id,
    isCompetitive: true,
    role: "participant",
    participant: {
      participantProject: null,
      caseProvided: false,
      caseName: null,
      stage: "none",
      submissionOpen: true,
    },
  });
  beforeEach(() => {
    profile.set({ id: 7 });
    program.set(Object.assign(Program.default(), { id: 12, isUserMember: true }));
    params = new BehaviorSubject(convertToParamMap({ programId: 12 }));
    responses = [];
    TestBed.configureTestingModule({
      providers: [
        ProgramRoleWidgetService,
        { provide: AuthInfoService, useValue: { profile } },
        { provide: ProgramDetailMainUIInfoService, useValue: { program } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: params.value }, paramMap: params },
        },
        {
          provide: GetProgramRoleWidgetUseCase,
          useValue: {
            execute: vi.fn(() => {
              const response = new Subject<Result<ProgramRoleWidget, ProgramWidgetError>>();
              responses.push(response);
              return response;
            }),
          },
        },
      ],
    });
    service = TestBed.inject(ProgramRoleWidgetService);
    TestBed.flushEffects();
  });
  it("starts loading and returns server data", () => {
    expect(service.state().status).toBe("loading");
    responses[0].next(ok(result()));
    expect(service.state()).toEqual({ status: "success", data: result() });
  });
  it("does not replace a failure with zero and permits explicit retry", () => {
    responses[0].next(fail("network"));
    expect(service.state()).toEqual({ status: "failure", error: "network", previous: undefined });
    service.retry();
    expect(responses).toHaveLength(2);
    responses[1].next(ok(result()));
    expect(service.state().status).toBe("success");
  });
  it.each(["forbidden", "unauthorized", "not_found", "integrity"] as const)(
    "does not retry %s",
    error => {
      responses[0].next(fail(error));
      service.retry();
      expect(responses).toHaveLength(1);
    },
  );
  it("clears on route changes before the resolver and ignores late responses", () => {
    responses[0].next(ok(result()));
    params.next(convertToParamMap({ programId: 13 }));
    expect(service.state().status).toBe("loading");
    TestBed.flushEffects();
    responses[0].next(ok(result()));
    expect(service.state().status).toBe("loading");
    program.set(Object.assign(new Program(), program(), { id: 13 }));
    TestBed.flushEffects();
    responses[1].next(ok(result(13)));
    expect(service.state()).toMatchObject({ status: "success", data: { programId: 13 } });
  });
  it("clears immediately on user and role changes", () => {
    responses[0].next(ok(result()));
    profile.set({ id: 8 });
    expect(service.state().status).toBe("loading");
    TestBed.flushEffects();
    responses[0].next(ok(result()));
    expect(service.state().status).toBe("loading");
    program.set(Object.assign(new Program(), program(), { isUserExpert: true }));
    TestBed.flushEffects();
    expect(responses).toHaveLength(3);
  });
  it("refreshes on successful domain changes and cancels on logout", () => {
    responses[0].next(ok(result()));
    const events = TestBed.inject(EventBus);
    events.emit({ type: "ProgramWidgetChanged", payload: {}, occurredAt: new Date() });
    expect(responses).toHaveLength(2);
    events.emit({ type: "LoggedOut", payload: {}, occurredAt: new Date() });
    responses[1].next(ok(result()));
    expect(service.state()).toMatchObject({ status: "failure", error: "unauthorized" });
    profile.set({ id: 8 });
    TestBed.flushEffects();
    expect(responses).toHaveLength(3);
  });
  it("does not request data for an unrelated user", () => {
    program.set(Object.assign(Program.default(), { id: 12 }));
    TestBed.flushEffects();
    expect(responses).toHaveLength(1);
    responses[0].next(ok(result()));
    expect(service.state()).toMatchObject({ status: "failure", error: "forbidden" });
  });
  it("rejects mismatched program data", () => {
    responses[0].next(ok(result(14)));
    expect(service.state()).toMatchObject({ status: "failure", error: "not_found" });
  });
});
