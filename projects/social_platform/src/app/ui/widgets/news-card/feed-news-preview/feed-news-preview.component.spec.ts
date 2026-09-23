/** @format */
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { FileModel } from "@domain/file/file.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { FeedNewsPreviewComponent } from "./feed-news-preview.component";
import { FeedNewsModalComponent } from "../feed-news-modal/feed-news-modal.component";

/** Реальный CDK overlay: проверяем границы кликов, клавиатуру и единый input вместо копии новости. */
describe("FeedNewsPreviewComponent", () => {
  let fixture: ComponentFixture<FeedNewsPreviewComponent>;
  let resize: (() => void)[];
  let disconnect: ReturnType<typeof vi.fn>;
  const news = {
    ...FeedNews.default(),
    id: 19,
    name: "Источник",
    text: "Короткая новость.",
    files: [],
    isUserLiked: false,
    likesCount: 0,
  };
  const image = {
    ...FileModel.default(),
    link: "/portrait.svg",
    name: "Портрет",
    mimeType: "image/svg+xml",
  };
  const root = () => fixture.nativeElement as HTMLElement;
  const card = () => root().querySelector<HTMLElement>("article")!;
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');

  beforeEach(async () => {
    resize = [];
    disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          resize.push(cb);
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    await TestBed.configureTestingModule({
      imports: [FeedNewsPreviewComponent],
      providers: [
        provideRouter([]),
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "IT" }) } },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    fixture = TestBed.createComponent(FeedNewsPreviewComponent);
    fixture.componentRef.setInput("news", news);
    fixture.componentRef.setInput("type", "project");
    fixture.componentRef.setInput("headline", "Короткая новость.");
    fixture.componentRef.setInput("summary", "");
    fixture.componentRef.setInput("resourceLink", ["/office/projects/51"]);
    fixture.componentRef.setInput("publishedAt", "2026-09-23T12:00:00Z");
    document.body.appendChild(root());
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    root().remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function open(action: () => void = () => card().click()) {
    action();
    fixture.detectChanges();
    const primitive = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    if (!primitive.overlayRef!.hasAttached())
      await firstValueFrom(primitive.overlayRef!.attachments());
    await fixture.whenStable();
    return primitive;
  }

  it.each(["project", "people"] as const)(
    "%s: нет пустой media-области; thumbnail появляется только с изображением",
    async type => {
      fixture.componentRef.setInput("type", type);
      await fixture.whenStable();
      expect(root().querySelector(".feed-preview__media")).toBeNull();
      expect(root().querySelector(".feed-preview__more")).toBeNull();
      expect(card().getAttribute("role")).toBe("button");
      expect(card().getAttribute("aria-label")).toContain("Открыть новость");
      fixture.componentRef.setInput("images", [image]);
      await fixture.whenStable();
      expect(root().querySelector(".feed-preview__thumbnail")?.getAttribute("src")).toBe(
        image.link,
      );
    },
  );

  it("Подробнее определяется обрезанием, обновляется при resize и исчезает когда текст помещается", async () => {
    fixture.componentRef.setInput("summary", "Очень длинная новость ".repeat(100));
    await fixture.whenStable();
    const text = root().querySelector<HTMLElement>(".feed-card__description")!;
    Object.defineProperty(text, "clientHeight", { configurable: true, value: 54 });
    Object.defineProperty(text, "scrollHeight", { configurable: true, value: 200 });
    resize.forEach(cb => cb());
    await fixture.whenStable();
    expect(root().querySelector(".feed-preview__more")).not.toBeNull();
    await open(() => root().querySelector<HTMLButtonElement>(".feed-preview__more")!.click());
    expect(dialog()).not.toBeNull();
    Object.defineProperty(text, "scrollHeight", { configurable: true, value: 54 });
    resize.forEach(cb => cb());
    await fixture.whenStable();
    expect(root().querySelector(".feed-preview__more")).toBeNull();
  });

  it.each(["card", "title", "description", "thumbnail", "Enter", " "])(
    "%s открывает одно окно",
    async target => {
      fixture.componentRef.setInput("images", [image]);
      fixture.componentRef.setInput("summary", "Подробности");
      await fixture.whenStable();
      await open(() => {
        if (target === "Enter" || target === " ") {
          const event = new KeyboardEvent("keydown", {
            key: target,
            bubbles: true,
            cancelable: true,
          });
          card().dispatchEvent(event);
          expect(event.defaultPrevented).toBe(true);
        } else {
          const selector = {
            card: "article",
            title: "h3",
            description: ".feed-card__description",
            thumbnail: "img.feed-preview__thumbnail",
          }[target]!;
          root().querySelector<HTMLElement>(selector)!.click();
        }
      });
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Закрыть новость");
    },
  );

  it.each(["like", "share", "source", "cta"])(
    "%s не открывает окно и не перехватывает клавиши внутреннего действия",
    async action => {
      const selectors = {
        like: 'button[aria-label="Нравится"]',
        share: 'button[aria-label="Скопировать ссылку на новость"]',
        source: ".feed-card__source-name",
        cta: ".feed-card__cta",
      };
      const like = vi.spyOn(fixture.componentInstance.like, "emit");
      const share = vi.spyOn(fixture.componentInstance.share, "emit");
      const element = root().querySelector<HTMLElement>(
        selectors[action as keyof typeof selectors],
      )!;
      const key = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      element.dispatchEvent(key);
      expect(key.defaultPrevented).toBe(false);
      element.click();
      await fixture.whenStable();
      expect(dialog()).toBeNull();
      if (action === "like") expect(like).toHaveBeenCalledOnce();
      if (action === "share") expect(share).toHaveBeenCalledOnce();
    },
  );

  it.each(["edit", "delete"])("owner menu / %s не открывает окно", async action => {
    fixture.componentRef.setInput("isOwner", true);
    await fixture.whenStable();
    const output = vi.spyOn(fixture.componentInstance[action as "edit" | "delete"], "emit");
    root().querySelector<HTMLButtonElement>('[aria-label="Действия с новостью"]')!.click();
    await fixture.whenStable();
    expect(dialog()).toBeNull();
    const options = root().querySelectorAll<HTMLButtonElement>(".feed-preview__options button");
    options[action === "edit" ? 0 : 1].click();
    await fixture.whenStable();
    expect(output).toHaveBeenCalledOnce();
    expect(dialog()).toBeNull();
  });

  it("лайк/копирование окна делегируются карточке; обновлённый input виден на обеих поверхностях", async () => {
    const like = vi.spyOn(fixture.componentInstance.like, "emit");
    const share = vi.spyOn(fixture.componentInstance.share, "emit");
    await open();
    dialog()!.querySelector<HTMLButtonElement>('[aria-label="Нравится"]')!.click();
    dialog()!
      .querySelector<HTMLButtonElement>('[aria-label="Скопировать ссылку на новость"]')!
      .click();
    expect(like).toHaveBeenCalledOnce();
    expect(share).toHaveBeenCalledOnce();
    const updated = { ...news, isUserLiked: true, likesCount: 1 };
    fixture.componentRef.setInput("news", updated);
    await fixture.whenStable();
    expect(
      fixture.debugElement.query(By.directive(FeedNewsModalComponent)).componentInstance.news(),
    ).toBe(updated);
    expect(root().querySelector('[aria-label="Нравится"]')?.getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(dialog()!.querySelector('[aria-label="Нравится"]')?.getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it.each(["button", "Escape", "backdrop"])(
    "%s закрывает окно и возвращает фокус на карточку",
    async method => {
      const primitive = await open();
      const detached = firstValueFrom(primitive.overlayRef!.detachments());
      if (method === "button")
        dialog()!.querySelector<HTMLButtonElement>('[aria-label="Закрыть новость"]')!.click();
      if (method === "backdrop") document.querySelector<HTMLElement>(".modal__overlay")!.click();
      if (method === "Escape")
        document.activeElement!.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      await detached;
      await fixture.whenStable();
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(card());
    },
  );

  it("уничтожение до отложенного attach очищает observer и не оставляет overlay", async () => {
    card().click();
    fixture.detectChanges();
    fixture.destroy();
    // Пропускаем уже поставленный shared modal setter, чтобы проверить именно гонку уничтожения.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(dialog()).toBeNull();
    expect(disconnect).toHaveBeenCalled();
  });
});
