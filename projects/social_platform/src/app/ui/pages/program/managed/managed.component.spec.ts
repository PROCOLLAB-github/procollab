/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { of } from "rxjs";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ManagedProgramsComponent } from "./managed.component";

describe("ManagedProgramsComponent", () => {
  const api = {
    capabilities: vi.fn(() => of({ canCreateProgram: false })),
    managed: vi.fn(() => of({ count: 0, next: null, previous: null, results: [] })),
  };
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: "managed", component: ManagedProgramsComponent }]),
        { provide: ProgramLaunchUseCase, useValue: api },
      ],
    }).compileComponents();
  });
  it("keeps search in the URL, resets offset and preserves it on pagination", async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/managed?search=исходный&offset=10",
      ManagedProgramsComponent,
    );
    expect(api.managed).toHaveBeenLastCalledWith({ search: "исходный", offset: 10, limit: 10 });
    component.search.setValue("новый");
    const router = TestBed.inject(Router);
    await vi.waitFor(() => {
      expect(router.parseUrl(router.url).queryParams).toEqual({ search: "новый" });
      expect(api.managed).toHaveBeenLastCalledWith({ search: "новый", offset: 0, limit: 10 });
    });
    component.page(1);
    await vi.waitFor(() =>
      expect(router.parseUrl(router.url).queryParams).toEqual({ search: "новый", offset: "10" }),
    );
  });
  it("does not offer creation when the separate permission is absent", async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl("/managed", ManagedProgramsComponent);
    expect(harness.routeNativeElement?.textContent).toContain("Программы пока не созданы");
    expect(
      harness.routeNativeElement?.querySelector('a[href="/office/program/create"]'),
    ).toBeNull();
  });
});
