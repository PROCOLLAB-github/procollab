/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";
import { User } from "@domain/auth/user.model";
import { ExpandService } from "@api/expand/expand.service";
import { ProfileLeftSideComponent } from "./profile-left-side.component";

describe("ProfileLeftSideComponent", () => {
  let fixture: ComponentFixture<ProfileLeftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileLeftSideComponent],
      providers: [provideRouter([]), ExpandService],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileLeftSideComponent);
    fixture.componentRef.setInput("user", {
      personal: { birthday: null, city: "", speciality: "" },
      relations: {
        userLanguages: [],
        programs: [{ id: 4, name: "Школа проектных команд", imageAddress: "/program.png" }],
      },
    } as unknown as User);
    fixture.detectChanges();
  });

  it("renders programs as compact named rectangular links", () => {
    const card = fixture.debugElement.query(By.css(".lists__program-card"));
    const routerLink = card.injector.get(RouterLink);

    expect(card.nativeElement.textContent).toContain("Школа проектных команд");
    expect(card.nativeElement.querySelector("img").getAttribute("src")).toBe("/program.png");
    const avatar = card.nativeElement.querySelector(".lists__program-avatar") as HTMLImageElement;
    expect(avatar.width).toBe(40);
    expect(avatar.height).toBe(40);
    const name = card.nativeElement.querySelector(".lists__program-name") as HTMLElement;
    expect(name.classList).toContain("lists__program-name--compact");
    expect(routerLink.urlTree.toString()).toContain("/office/program/4");
  });

  it("uses the same round avatar context for a missing program image", () => {
    fixture.componentRef.setInput("user", {
      personal: { birthday: null, city: "", speciality: "" },
      relations: { userLanguages: [], programs: [{ id: 7, name: "Без изображения" }] },
    } as unknown as User);
    fixture.detectChanges();
    const placeholder = fixture.nativeElement.querySelector(
      ".lists__program-avatar.lists__program-placeholder",
    ) as HTMLElement;
    expect(placeholder).not.toBeNull();
    expect(placeholder.classList).toContain("lists__program-avatar");
  });

  it("keeps a long program name intact in the two-line compact name container", () => {
    const longName = "Международная программа развития проектного предпринимательства";
    fixture.componentRef.setInput("user", {
      personal: { birthday: null, city: "", speciality: "" },
      relations: { userLanguages: [], programs: [{ id: 9, name: longName }] },
    } as unknown as User);
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector(".lists__program-name") as HTMLElement;
    expect(name.textContent?.trim()).toBe(longName);
    expect(name.classList).toContain("lists__program-name--compact");
  });

  it.each(["Санкт-Петербург", "Набережные Челны", "Мсква"])(
    "renders the complete user region %s without normalization",
    city => {
      fixture.componentRef.setInput("user", {
        personal: { birthday: null, city, speciality: "" },
        relations: { userLanguages: [], programs: [] },
      } as unknown as User);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector(".lists__item-value").textContent.trim()).toBe(
        city,
      );
    },
  );
});
