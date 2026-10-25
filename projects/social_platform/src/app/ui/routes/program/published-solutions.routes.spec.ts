/** @format */
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, RouterOutlet } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthRequiredGuard } from "@core/lib/guards/auth/auth-required.guard";
import { TokenService } from "@core/lib/services/tokens/token.service";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";
import {
  GetPublishedSolutionsUseCase,
  GetPublishedSolutionUseCase,
} from "@api/solution/use-cases/solution-publication.use-cases";
import { ok } from "@domain/shared/result.type";
import { Program } from "@domain/program/program.model";
import { PublicProgramSolutionsComponent } from "@ui/pages/program/published-solutions/public-program-solutions.component";
import { PUBLISHED_SOLUTION_ROUTES } from "./published-solutions.routes";

@Component({ template: "private", standalone: true })
class PrivatePage {}
@Component({ template: "login", standalone: true })
class LoginPage {}
describe("Доступ внешнего посетителя к опубликованным решениям", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          ...PUBLISHED_SOLUTION_ROUTES,
          {
            path: "office",
            canActivate: [AuthRequiredGuard],
            children: [{ path: "**", component: PrivatePage }],
          },
          { path: "auth/login", component: LoginPage },
        ]),
        { provide: TokenService, useValue: { getTokens: () => null } },
        {
          provide: GetProgramUseCase,
          useValue: {
            execute: () =>
              of(ok(Object.assign(Program.default(), { id: 14, solutionStorageMode: "solution" }))),
          },
        },
        {
          provide: GetPublishedSolutionsUseCase,
          useValue: {
            execute: () =>
              of(ok({ programId: 14, count: 0, next: null, previous: null, results: [] })),
          },
        },
        { provide: GetPublishedSolutionUseCase, useValue: { execute: vi.fn() } },
      ],
    });
    TestBed.overrideComponent(PublicProgramSolutionsComponent, {
      set: { template: "<router-outlet />", imports: [RouterOutlet] },
    });
  });
  it("открывает точный публичный маршрут без аккаунта", async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl("/office/program/14/published-solutions");
    expect(TestBed.inject(Router).url).toBe("/office/program/14/published-solutions");
    expect(harness.routeNativeElement!.textContent).toContain("Решения программы");
  });
  it.each([
    "/office/program/14",
    "/office/program/14/projects",
    "/office/program/14/solutions/501",
    "/office/program/14/solutions/501/edit",
    "/office/program/14/management/projects",
  ])("сохраняет прежний auth guard для %s", async path => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(path);
    expect(TestBed.inject(Router).url).toMatch(/^\/auth\/login\?/);
    expect(harness.routeNativeElement!.textContent).toBe("login");
  });
});
