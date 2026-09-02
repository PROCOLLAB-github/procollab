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

  it("renders programs as named rectangular links", () => {
    const card = fixture.debugElement.query(By.css(".lists__program-card"));
    const routerLink = card.injector.get(RouterLink);

    expect(card.nativeElement.textContent).toContain("Школа проектных команд");
    expect(card.nativeElement.querySelector("img").getAttribute("src")).toBe("/program.png");
    expect(routerLink.urlTree.toString()).toContain("/office/program/4");
  });

  it("renders the complete user city without hard truncation", () => {
    fixture.componentRef.setInput("user", {
      personal: { birthday: null, city: "Санкт-Петербург", speciality: "" },
      relations: { userLanguages: [], programs: [] },
    } as unknown as User);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".lists__item-value").textContent.trim()).toBe(
      "Санкт-Петербург",
    );
  });
});
