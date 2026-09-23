/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { By } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { FileModel } from "@domain/file/file.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { CarouselComponent } from "../carousel/carousel.component";
import { FeedNewsModalComponent } from "./feed-news-modal.component";

describe("FeedNewsModalComponent", () => {
  it("показывает полный текст, переносы, ссылку, все файлы и contain-карусель без detail HTTP", async () => {
    await TestBed.configureTestingModule({
      imports: [FeedNewsModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FeedNewsModalComponent);
    const text = "Полный текст ".repeat(300) + "\nhttps://example.test/news\nПоследняя строка";
    const image = {
      ...FileModel.default(),
      link: "/portrait.svg",
      name: "Портрет",
      mimeType: "image/svg+xml",
    };
    const file = {
      ...FileModel.default(),
      link: "/test.pdf",
      name: "Документ.pdf",
      mimeType: "application/pdf",
    };
    fixture.componentRef.setInput("news", { ...FeedNews.default(), name: "Источник", text });
    fixture.componentRef.setInput("type", "project");
    fixture.componentRef.setInput("resourceLink", ["/office/projects/51"]);
    fixture.componentRef.setInput("images", [image, { ...image, link: "/landscape.svg" }]);
    fixture.componentRef.setInput("files", [file]);
    fixture.autoDetectChanges();
    fixture.detectChanges();
    const primitive = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    await firstValueFrom(primitive.overlayRef!.attachments());
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const content = dialog.querySelector(".feed-news-modal__text")!;
    expect(content.textContent).toContain("Полный текст ".repeat(300));
    expect(content.textContent).toContain("Последняя строка");
    expect(content.querySelectorAll("br")).toHaveLength(2);
    expect(content.querySelector("a")?.getAttribute("href")).toBe("https://example.test/news");
    expect(dialog.querySelector("a[download]")?.getAttribute("href")).toBe(file.link);
    expect(dialog.querySelector("a[download]")?.getAttribute("download")).toBe(file.name);
    const carousel = fixture.debugElement.query(By.directive(CarouselComponent))
      .componentInstance as CarouselComponent;
    expect(carousel.fit()).toBe("contain");
    dialog.querySelector<HTMLButtonElement>('[aria-label="Следующее изображение"]')!.click();
    await fixture.whenStable();
    expect(dialog.querySelector("app-carousel img")?.getAttribute("src")).toBe("/landscape.svg");
    expect(dialog.querySelectorAll(".cdk-focus-trap-anchor")).toHaveLength(2);
    fixture.destroy();
  });
});
