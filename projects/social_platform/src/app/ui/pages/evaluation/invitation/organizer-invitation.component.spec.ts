/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { TokenService } from "@corelib";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ProgramOrganizersUseCase } from "@api/program/use-cases/program-organizers.use-case";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ExpertInvitationComponent } from "./expert-invitation.component";

function setup() {
  const invitation = {
    id: 1,
    email: "organizer@example.com",
    status: "pending",
    accountExists: false,
    matchesAccount: false,
    program: { id: 7, name: "Программа" },
  };
  const api = {
    invitation: vi.fn(() => of(invitation)),
    accept: vi.fn(() => of({ programId: 7, accepted: true })),
    register: vi.fn(() => of({ access: "access", refresh: "refresh", programId: 7 })),
    resetPassword: vi.fn(() => of(undefined)),
  };
  const expertApi = { invitation: vi.fn(), accept: vi.fn(), register: vi.fn() };
  TestBed.configureTestingModule({
    imports: [ExpertInvitationComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ token: "organizer-invitation-token-0123456789" })),
          snapshot: { data: { invitationRole: "organizer" }, queryParamMap: convertToParamMap({}) },
        },
      },
      { provide: ProgramOrganizersUseCase, useValue: api },
      { provide: EvaluationUseCase, useValue: expertApi },
      {
        provide: TokenService,
        useValue: { getTokens: () => null, memTokens: vi.fn(), clearTokens: vi.fn() },
      },
      { provide: LoginUseCase, useValue: { execute: vi.fn() } },
      {
        provide: ProfileInfoService,
        useValue: { invalidateProfile: vi.fn(), ensureProfileLoaded: vi.fn() },
      },
    ],
  });
  const fixture = TestBed.createComponent(ExpertInvitationComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api, expertApi };
}
describe("Приглашение организатора", () => {
  it("загружает отдельное приглашение и не принимает его при открытии ссылки", () => {
    const { fixture, api, expertApi } = setup();
    expect(fixture.nativeElement.textContent).toContain("Приглашение организатора");
    expect(fixture.nativeElement.textContent).toContain("Вас пригласили стать организатором");
    expect(fixture.nativeElement.textContent).not.toContain("Вас пригласили стать экспертом");
    expect(api.invitation).toHaveBeenCalledOnce();
    expect(api.accept).not.toHaveBeenCalled();
    expect(expertApi.invitation).not.toHaveBeenCalled();
  });
  it("требует дату рождения и направляет регистрацию в API организаторов", () => {
    const { component, api, expertApi } = setup();
    component.registration.patchValue({
      firstName: "Анна",
      lastName: "Волкова",
      password: "SafeOrganizer234!",
      repeatPassword: "SafeOrganizer234!",
      acceptAge: true,
      acceptPolicy: true,
    });
    component.register();
    expect(api.register).not.toHaveBeenCalled();
    component.organizerBirthday.setValue("1990-01-01");
    component.register();
    expect(api.register).toHaveBeenCalledWith(
      "organizer-invitation-token-0123456789",
      expect.objectContaining({ birthday: "1990-01-01", firstName: "Анна" }),
    );
    expect(expertApi.register).not.toHaveBeenCalled();
    expect(component.mode()).toBe("joined");
  });
});
