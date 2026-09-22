/** @format */

import { OverlayContainer } from "@angular/cdk/overlay";
import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { fail, ok } from "@domain/shared/result.type";
import { InfoCardComponent } from "./info-card.component";
import { projectCardFixture } from "./info-card.fixture";

type ResponseOf<T> = T extends Observable<infer R> ? R : never;

describe.each(["base", "subs"] as const)("InfoCard: асинхронная подписка (%s)", appearance => {
  let fixture: ComponentFixture<InfoCardComponent>;
  let added: Subject<ResponseOf<ReturnType<AddProjectSubscriptionUseCase["execute"]>>>;
  let deleted: Subject<ResponseOf<ReturnType<DeleteProjectSubscriptionUseCase["execute"]>>>;
  const add = { execute: vi.fn<AddProjectSubscriptionUseCase["execute"]>() };
  const remove = { execute: vi.fn<DeleteProjectSubscriptionUseCase["execute"]>() };

  beforeEach(async () => {
    vi.clearAllMocks();
    added = new Subject();
    deleted = new Subject();
    add.execute.mockReturnValue(added);
    remove.execute.mockReturnValue(deleted);
    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: IndustryRepositoryPort, useValue: { getOne: () => null } },
        { provide: AddProjectSubscriptionUseCase, useValue: add },
        { provide: DeleteProjectSubscriptionUseCase, useValue: remove },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InfoCardComponent);
    fixture.componentRef.setInput("info", projectCardFixture());
    fixture.componentRef.setInput("profileId", 101);
    fixture.componentRef.setInput("appereance", appearance);
    fixture.componentRef.setInput("showSubscriptionAction", true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(async () => {
    added.complete();
    deleted.complete();
    // Штатный modal открепляет CDK portal в следующем такте.
    await new Promise(resolve => setTimeout(resolve, 0));
    vi.restoreAllMocks();
  });

  const bookmark = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector(".card__subscription-action");
  const overlay = (): HTMLElement => TestBed.inject(OverlayContainer).getContainerElement();

  /** Ожидаем штатное обновление Angular и таймер modal, не подменяя его detectChanges. */
  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();
  }

  async function openConfirmation(): Promise<HTMLButtonElement> {
    fixture.componentRef.setInput("isSubscribed", true);
    await settle();
    bookmark().click();
    await settle();
    return overlay().querySelector<HTMLButtonElement>(".unsubscribe-modal__buttons button")!;
  }

  it("закрашивает закладку после отложенного ответа без перезагрузки и второго клика", async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl");
    bookmark().click();
    await settle();
    expect(bookmark().getAttribute("aria-pressed")).toBe("false");

    added.next(ok(undefined));
    await settle();

    expect(add.execute).toHaveBeenCalledExactlyOnceWith(101);
    expect(bookmark().getAttribute("aria-pressed")).toBe("true");
    expect(bookmark().getAttribute("aria-label")).toBe("Отписаться от проекта");
    expect(bookmark().querySelector("use")?.getAttribute("xlink:href")).toContain(
      "#subscribe-badge",
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it("закрывает подтверждение и снимает закладку после одного нажатия «отписаться»", async () => {
    const confirm = await openConfirmation();
    expect(confirm).not.toBeNull();
    confirm.click();
    await settle();
    expect(overlay().querySelector(".unsubscribe-modal")).not.toBeNull();

    deleted.next(ok(undefined));
    await settle();

    expect(remove.execute).toHaveBeenCalledExactlyOnceWith(101);
    expect(bookmark().getAttribute("aria-pressed")).toBe("false");
    expect(bookmark().getAttribute("aria-label")).toBe("Подписаться на проект");
    expect(bookmark().querySelector("use")?.getAttribute("xlink:href")).toContain(
      "#unsubscribe-badge",
    );
    expect(overlay().querySelector(".unsubscribe-modal")).toBeNull();
  });

  it("не закрашивает закладку при ошибке подписки", async () => {
    bookmark().click();
    await settle();
    added.next(fail({ kind: "add_project_subscription_error", cause: new Error("network") }));
    await settle();
    expect(bookmark().getAttribute("aria-pressed")).toBe("false");
    expect(overlay().querySelector(".unsubscribe-modal")).toBeNull();
  });

  it("сохраняет подписку и подтверждение при ошибке, после успешного повтора закрывает", async () => {
    const confirm = await openConfirmation();
    confirm.click();
    await settle();
    deleted.next(fail({ kind: "delete_project_subscription_error", cause: new Error("network") }));
    deleted.complete();
    await settle();
    expect(bookmark().getAttribute("aria-pressed")).toBe("true");
    expect(overlay().querySelector(".unsubscribe-modal")).not.toBeNull();

    deleted = new Subject();
    remove.execute.mockReturnValue(deleted);
    confirm.click();
    await settle();
    deleted.next(ok(undefined));
    await settle();
    expect(bookmark().getAttribute("aria-pressed")).toBe("false");
    expect(overlay().querySelector(".unsubscribe-modal")).toBeNull();
    expect(remove.execute).toHaveBeenCalledTimes(2);
  });
});
