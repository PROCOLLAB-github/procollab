/** @format */
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { userFromRaw } from "@utils/userRaw";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { MemberCardComponent } from "./member-card.component";

describe("Карточка каталога участников", () => {
  it.each([0, 1, 2, 5, 50])(
    "показывает первые два навыка и точный +N при %s навыках",
    async count => {
      await TestBed.configureTestingModule({
        imports: [MemberCardComponent],
        providers: [provideRouter([])],
      }).compileComponents();
      const f = TestBed.createComponent(MemberCardComponent);
      const skills = Array.from({ length: count }, (_, id) => ({
        id,
        name: id === 0 ? "ОченьДлинныйНавыкБезПробеловДляПроверкиОбрезки" : "Навык " + id,
      }));
      f.componentRef.setInput("member", userFromRaw({ id: 42, firstName: "Имя", skills }));
      await f.whenStable();
      const root = f.nativeElement as HTMLElement;
      expect(root.querySelectorAll(".member-card__skill")).toHaveLength(Math.min(count, 2));
      expect(root.querySelector(".member-card__skills-area")).not.toBeNull();
      const more = root.querySelector(".member-card__more");
      if (count > 2) {
        expect(more?.textContent?.trim()).toBe("+" + (count - 2));
        expect(more).toBe(root.querySelector(".member-card__skills")?.lastElementChild);
        expect(more?.getAttribute("title")).toContain("Навык 2");
      } else expect(more).toBeNull();
      if (count)
        expect(root.querySelector(".member-card__skill")?.getAttribute("title")).toBe(
          skills[0].name,
        );
      // Замена данных не требует ResizeObserver или ожидания загрузки шрифта.
      f.componentRef.setInput("member", userFromRaw({ id: 42, skills: [] }));
      await f.whenStable();
      expect(root.querySelector(".member-card__more")).toBeNull();
      expect(root.querySelector(".member-card__skills-area")).not.toBeNull();
      f.destroy();
    },
  );

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
