/** @format */
import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideRouter, Router } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { OverlayContainer } from "@angular/cdk/overlay";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { MembersInfoService } from "@api/member/facades/members-info.service";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { SearchesService } from "@api/searches/searches.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { MembersComponent } from "./members.component";
import { MemberFiltersDialogComponent } from "./member-filters-dialog/member-filters-dialog.component";
import { MembersFiltersComponent } from "./members-filters/members-filters.component";

describe("Мобильное представление участников", () => {
  const layout = new BehaviorSubject({ matches: true, breakpoints: {} });
  const redirect = vi.fn();
  beforeEach(async () => {
    layout.next({ matches: true, breakpoints: {} });
    redirect.mockReset();
    await TestBed.configureTestingModule({
      imports: [MembersComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: BreakpointObserver, useValue: { observe: () => layout, isMatched: () => true } },
        {
          provide: SearchesService,
          useValue: {
            inlineSpecs: signal([]),
            inlineSkills: signal([]),
            onSearchSpec: vi.fn(),
            onSearchSkill: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(MembersComponent, {
        set: {
          providers: [
            MembersUIInfoService,
            {
              provide: MembersInfoService,
              useValue: {
                initializationMembers: vi.fn(),
                initScroll: vi.fn(),
                redirectToProfile: redirect,
              },
            },
            { provide: ProfileDetailUIInfoService, useValue: {} },
          ],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
    TestBed.resetTestingModule();
  });

  async function page() {
    const f = TestBed.createComponent(MembersComponent);
    document.body.appendChild(f.nativeElement);
    f.autoDetectChanges();
    await f.whenStable();
    return f;
  }

  async function finish(f: Awaited<ReturnType<typeof page>>) {
    // Search CVA обновляет value через setTimeout: даём ему закончить до уничтожения fixture.
    await new Promise(resolve => setTimeout(resolve, 0));
    f.destroy();
  }

  async function open(f: Awaited<ReturnType<typeof page>>) {
    f.nativeElement.querySelector(".page__action--filters").click();
    f.detectChanges();
    const primitive = f.debugElement
      .query(By.directive(MemberFiltersDialogComponent))
      .query(By.directive(ModalComponent)).componentInstance as ModalComponent;
    await firstValueFrom(primitive.overlayRef!.attachments());
    await f.whenStable();
    return primitive;
  }

  it("использует прежний search control и переход в профиль, не держит фильтры рядом со списком", async () => {
    const f = await page();
    const ui = f.debugElement.injector.get(MembersUIInfoService);
    const input = f.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = "  Иван   Иванов  ";
    input.dispatchEvent(new Event("input"));
    expect(ui.searchForm.controls.search.value).toBe("  Иван   Иванов  ");
    expect(f.debugElement.query(By.directive(MembersFiltersComponent))).toBeNull();
    f.nativeElement.querySelectorAll(".page__action")[1].click();
    expect(redirect).toHaveBeenCalledOnce();
    layout.next({ matches: false, breakpoints: {} });
    await f.whenStable();
    expect(f.debugElement.query(By.directive(SearchComponent))).not.toBeNull();
    expect(f.debugElement.query(By.directive(MembersFiltersComponent))).not.toBeNull();
    expect(f.nativeElement.querySelector(".page__action--filters")).toBeNull();
    await finish(f);
  });

  it("открывает ту же форму отдельно, сохраняет фильтры после закрытия, возвращает фокус", async () => {
    const f = await page();
    const ui = f.debugElement.injector.get(MembersUIInfoService);
    ui.filterForm.patchValue({ keySkill: "Java", speciality: "Разработчик" });
    const primitive = await open(f);
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Фильтры участников");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Закрыть фильтры");
    const filters = f.debugElement
      .query(By.directive(MemberFiltersDialogComponent))
      .query(By.directive(MembersFiltersComponent)).componentInstance as MembersFiltersComponent;
    expect(filters.filterForm()).toBe(ui.filterForm);
    const detached = firstValueFrom(primitive.overlayRef!.detachments());
    dialog.querySelector<HTMLButtonElement>(".member-filters-dialog__done")!.click();
    await detached;
    await f.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(ui.filterForm.controls.keySkill.value).toBe("Java");
    expect(document.activeElement).toBe(f.nativeElement.querySelector(".page__action--filters"));
    await open(f);
    expect(ui.filterForm.controls.speciality.value).toBe("Разработчик");
    await finish(f);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it.each(["Escape", "backdrop", "desktop"])("закрывает окно: %s", async reason => {
    const f = await page();
    const primitive = await open(f);
    const detached = firstValueFrom(primitive.overlayRef!.detachments());
    if (reason === "Escape")
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    else if (reason === "backdrop") document.querySelector<HTMLElement>(".modal__overlay")!.click();
    else layout.next({ matches: false, breakpoints: {} });
    await detached;
    await f.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await finish(f);
  });

  it("Сбросить вызывает существующий обработчик и очищает ту же форму", async () => {
    const f = await page();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigate").mockResolvedValue(true);
    const ui = f.debugElement.injector.get(MembersUIInfoService);
    ui.filterForm.patchValue({ keySkill: "Java", speciality: "Разработчик" });
    await open(f);
    document.querySelector<HTMLButtonElement>(".member-filters-dialog .filters__clear")!.click();
    await f.whenStable();
    expect(navigate).toHaveBeenCalledOnce();
    expect(ui.filterForm.controls.keySkill.value).toBeNull();
    expect(ui.filterForm.controls.speciality.value).toBeNull();
    await finish(f);
  });
});
