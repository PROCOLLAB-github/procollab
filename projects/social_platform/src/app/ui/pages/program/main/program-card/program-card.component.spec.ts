/** @format */
import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { DesktopLayoutService } from "@uilib";
import { ProgramCardComponent, ProgramCardData } from "./program-card.component";

describe("ProgramCardComponent", () => {
  let fixture: ComponentFixture<ProgramCardComponent>;
  const desktop = signal(true);
  const program: ProgramCardData = {
    id: 7,
    name: "Программа",
    datetimeStarted: "2099-11-10T00:00:00Z",
    datetimeFinished: "2099-11-30T00:00:00Z",
    datetimeRegistrationEnds: "2099-11-15T00:00:00Z",
  };
  const setProgram = (patch: Partial<ProgramCardData>) => {
    fixture.componentRef.setInput("program", { ...program, ...patch });
    fixture.detectChanges();
  };
  const element = () => fixture.nativeElement as HTMLElement;
  beforeEach(async () => {
    desktop.set(true);
    await TestBed.configureTestingModule({
      imports: [ProgramCardComponent],
      providers: [provideRouter([]), { provide: DesktopLayoutService, useValue: { desktop } }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgramCardComponent);
    setProgram({});
  });
  it("shows the public card as a single catalog link target", () => {
    expect(element().querySelector(".card__name")?.textContent).toContain(program.name);
    expect(element().querySelector(".program-card__more")?.textContent).toContain("Подробнее");
    expect(element().querySelector("a")).toBeNull();
  });
  it("keeps expiry ahead of membership and updates reused inputs", () => {
    setProgram({ isUserMember: true });
    expect(element().querySelector(".card__registration--participating")).not.toBeNull();
    setProgram({ isUserMember: true, datetimeRegistrationEnds: "2000-01-01T00:00:00Z" });
    expect(element().querySelector(".card__registration--ended")?.textContent).toContain(
      "Регистрация завершена",
    );
    expect(element().querySelector(".card__registration--participating")).toBeNull();
  });
  it("continues a draft without inventing dates or an open registration", () => {
    fixture.componentRef.setInput("management", true);
    setProgram({
      draft: true,
      datetimeStarted: null,
      datetimeFinished: null,
      datetimeRegistrationEnds: null,
    });
    expect(element().querySelector(".card__registration")?.textContent).toContain("Черновик");
    expect(element().querySelector(".card__dates")?.textContent).toContain("Сроки не заданы");
    expect(element().textContent).not.toContain("Опубликована");
    expect(element().querySelector(".card")?.closest("a")).toBeNull();
    expect(element().querySelector(".program-card__actions a")?.getAttribute("href")).toBe(
      "/office/program/7/launch",
    );
  });
  it.each([true, false])(
    "links a published card to program details and keeps management separate (desktop: %s)",
    desktopLayout => {
      desktop.set(desktopLayout);
      fixture.componentRef.setInput("management", true);
      setProgram({ draft: false });
      expect(element().querySelector(".card__registration")?.textContent).toContain(
        "Регистрация до",
      );
      expect(element().textContent).toContain("Опубликована");
      expect(element().querySelector(".card")?.closest("a")?.getAttribute("href")).toBe(
        "/office/program/7",
      );
      expect(element().querySelector(".program-card__actions a")?.getAttribute("href")).toBe(
        "/office/program/7/management/analytics",
      );
    },
  );
  it("uses the saved image and keeps the native mobile avatar", () => {
    desktop.set(false);
    setProgram({
      imageAddress: "https://example.com/logo.png",
      imageFraming: { logo: { x: 0.2, y: 0.7, zoom: 1.5 } },
    });
    expect(element().querySelector(".card__photo img")?.getAttribute("src")).toBe(
      "https://example.com/logo.png",
    );
    expect(element().querySelector(".card__photo .avatar")?.getAttribute("style")).toContain(
      "72px",
    );
    expect(element().querySelector("h3")?.getAttribute("title")).toBe(program.name);
  });
  it("does not imply registration is open without a deadline", () => {
    setProgram({ datetimeRegistrationEnds: null });
    expect(element().querySelector(".card__registration--not-set")?.textContent).toContain(
      "Срок регистрации не задан",
    );
  });
  it("reads the status before identity and keeps full long content available", () => {
    const name = "Очень длинное название программы для команд и предпринимателей ".repeat(4);
    const shortDescription = "Длинное описание программы с материалами и поддержкой ".repeat(4);
    setProgram({ name, shortDescription });
    const statuses = element().querySelector(".card__statuses")!;
    const identity = element().querySelector(".card__identity")!;
    expect(statuses.compareDocumentPosition(identity) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(element().querySelector(".card__name")?.textContent).toBe(name);
    expect(element().querySelector(".card__name")?.getAttribute("title")).toBe(name);
    expect(element().querySelector(".card__description")?.textContent).toBe(
      shortDescription.trim(),
    );
    expect(element().querySelector(".program-card__actions")?.textContent).toContain("Подробнее");
  });
  it("shows only a nonempty catalog description and uses a program icon without an image", () => {
    setProgram({ shortDescription: "  Описание программы  " });
    expect(element().querySelector(".card__description")?.textContent).toBe("Описание программы");
    expect(element().querySelector(".card__photo--placeholder [icon='folder']")).not.toBeNull();
    expect(element().querySelector(".card__dates")?.textContent).not.toContain("для всей России");

    setProgram({ shortDescription: "   " });
    expect(element().querySelector(".card__description")).toBeNull();

    fixture.componentRef.setInput("management", true);
    setProgram({ shortDescription: "Описание программы" });
    expect(element().querySelector(".card__description")).toBeNull();
  });
});
