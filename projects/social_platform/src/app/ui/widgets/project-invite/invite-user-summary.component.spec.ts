/** @format */

import { TestBed } from "@angular/core/testing";
import { InviteUserSummaryComponent } from "./invite-user-summary.component";

describe("Участник без обязательных персональных полей", () => {
  const render = (changes: Record<string, unknown> = {}) => {
    TestBed.configureTestingModule({ imports: [InviteUserSummaryComponent] });
    const fixture = TestBed.createComponent(InviteUserSummaryComponent);
    const user = {
      id: 71,
      firstName: "",
      lastName: "",
      email: "member@example.test",
      personal: { birthday: null, avatar: "", speciality: "" },
      relations: { skills: [] },
      ...changes,
    };
    fixture.componentRef.setInput("user", user);
    fixture.detectChanges();
    return { fixture, user, text: fixture.nativeElement.textContent as string };
  };

  it("показывает возвращенную почту вместо пустого имени и сохраняет профиль", () => {
    const { fixture, user } = render();
    expect(fixture.nativeElement.querySelector("strong").textContent).toBe("member@example.test");
    expect(user.firstName).toBe("");
    expect(user.lastName).toBe("");
    expect(user.personal.birthday).toBeNull();
  });

  it("не считает возраст от 1970 года для отсутствующей даты рождения", () => {
    const { fixture } = render();
    expect(fixture.componentInstance.age()).toBe("");
    expect(fixture.nativeElement.querySelector(".invite-meta").textContent.trim()).toBe("");
  });

  it("сохраняет обычное имя и дает понятный идентификатор без почты", () => {
    const { fixture } = render({ firstName: "Анна", lastName: "Иванова" });
    expect(fixture.nativeElement.querySelector("strong").textContent).toBe("Анна Иванова");
    fixture.componentRef.setInput("user", {
      id: 72,
      firstName: "",
      lastName: "",
      personal: { avatar: "", birthday: null },
      relations: { skills: [] },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("strong").textContent).toBe("Участник №72");
  });
});
