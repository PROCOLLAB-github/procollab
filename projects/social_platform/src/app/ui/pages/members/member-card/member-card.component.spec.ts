/** @format */
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { userFromRaw } from "@utils/userRaw";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { fitMemberSkills, MemberCardComponent } from "./member-card.component";

describe("Карточка каталога участников", () => {
  it.each([
    [130, [], 24, 0],
    [130, [50, 60], 24, 2],
    [130, [200], 24, 1],
    [130, [120, 120, 120], 24, 1],
    [130, [40, 40, 40, 40, 40, 40, 40], 24, 5],
    [130, [64, 62.2, 64, 62.2, 20], 24, 2],
    [0, [50], 24, 0],
  ])("две строки с резервом +N: %s / %s", (width, widths, badge, expected) => {
    expect(fitMemberSkills(width as number, widths as number[], badge as number)).toBe(expected);
  });

  it("сохраняет полный текст, аватар и одну ссылку на правильный профиль", async () => {
    await TestBed.configureTestingModule({
      imports: [MemberCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const f = TestBed.createComponent(MemberCardComponent);
    f.componentRef.setInput(
      "member",
      userFromRaw({
        id: 101,
        firstName: "Александра",
        lastName: "Константинопольская",
        speciality: "Разработчик",
        avatar: "/avatar.svg",
        skills: [],
      }),
    );
    await f.whenStable();
    const root = f.nativeElement as HTMLElement;
    expect(root.querySelector("h3")?.textContent).toContain("Константинопольская");
    expect(root.querySelector("h3")?.getAttribute("title")).toBe("Александра Константинопольская");
    expect(root.querySelectorAll("a")).toHaveLength(1);
    expect(root.querySelector("a")?.getAttribute("href")).toBe("/office/profile/101");
    expect(root.querySelector("a button, a a")).toBeNull();
    const avatar = f.debugElement.query(By.directive(AvatarComponent))
      .componentInstance as AvatarComponent;
    expect(avatar.size()).toBe(70);
    expect(avatar.url()).toBe("/avatar.svg");
    expect(root.querySelectorAll(".member-card__skills li")).toHaveLength(0);
    f.destroy();
  });
});
