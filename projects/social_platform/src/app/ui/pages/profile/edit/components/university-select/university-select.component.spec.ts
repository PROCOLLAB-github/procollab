/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Subject, of, throwError } from "rxjs";
import { UniversityHttpAdapter } from "@infrastructure/adapters/profile/university-http.adapter";
import { UniversitySelectComponent } from "./university-select.component";

const university = {
  id: 1,
  name: "Московский политехнический университет",
  fullName: "",
  aliases: "Московский политех",
  city: "Москва",
};
const page = { results: [university], count: 1, next: null, previous: null };

describe("UniversitySelectComponent", () => {
  let fixture: ComponentFixture<UniversitySelectComponent>;
  let component: UniversitySelectComponent;
  let search: ReturnType<typeof vi.fn>;
  let changed: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    search = vi.fn().mockReturnValue(of(page));
    await TestBed.configureTestingModule({
      imports: [UniversitySelectComponent],
      providers: [{ provide: UniversityHttpAdapter, useValue: { search } }],
    }).compileComponents();
    fixture = TestBed.createComponent(UniversitySelectComponent);
    component = fixture.componentInstance;
    changed = vi.fn();
    component.registerOnChange(changed);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function type(value: string) {
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = value;
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
  }

  it("preserves a legacy name exactly and never writes during initialization or lookup", async () => {
    const oldName = "  Старое название ВУЗа  ";
    component.writeValue(oldName);
    component.onFocus();
    await vi.waitFor(() => expect(search).toHaveBeenCalled());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("input").value).toBe(oldName);
    expect(changed).not.toHaveBeenCalled();
  });

  it("opens the list without typing and commits a selected name", async () => {
    component.browse();
    await vi.waitFor(() => expect(component.universities()).toEqual([university]));
    fixture.detectChanges();
    expect(search).toHaveBeenCalledWith("", 0);
    (fixture.nativeElement.querySelector('[role="option"]') as HTMLElement).click();
    expect(changed).toHaveBeenLastCalledWith(university.name);
    expect(component.open()).toBe(false);
  });

  it("offers Other when nothing matches and keeps the typed institution name", async () => {
    search.mockReturnValue(of({ ...page, results: [], count: 0 }));
    type("Школа № 42");
    expect(changed).toHaveBeenLastCalledWith("");
    await vi.waitFor(() => expect(search).toHaveBeenCalledWith("Школа № 42", 0));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Совпадений нет");
    (fixture.nativeElement.querySelector('[role="option"]') as HTMLElement).click();
    expect(changed).toHaveBeenLastCalledWith("Школа № 42");
    type("Школа № 43");
    expect(changed).toHaveBeenLastCalledWith("Школа № 43");
  });

  it("ignores late results from an earlier query", async () => {
    const oldResponse = new Subject<typeof page>();
    search.mockReturnValueOnce(oldResponse).mockReturnValue(of({ ...page, results: [], count: 0 }));
    type("моск");
    await vi.waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    type("несуществующий");
    oldResponse.next(page);
    expect(component.universities()).toEqual([]);
    await vi.waitFor(() => expect(search).toHaveBeenCalledTimes(2));
    expect(component.universities()).toEqual([]);
  });

  it("shows a retryable error and allows Other if the API is unavailable", async () => {
    search.mockReturnValue(throwError(() => new Error("offline")));
    component.browse();
    await vi.waitFor(() => expect(component.failed()).toBe(true));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Не удалось загрузить список");
    expect(fixture.nativeElement.textContent).toContain("Другое");
  });

  it("supports keyboard selection and Escape", async () => {
    component.browse();
    await vi.waitFor(() => expect(component.universities()).toHaveLength(1));
    component.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    component.onKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(changed).toHaveBeenLastCalledWith(university.name);
    component.onFocus();
    component.onKeyDown(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(component.open()).toBe(false);
  });

  it("loads the next page and respects disabled state", async () => {
    search
      .mockReturnValueOnce(of({ ...page, count: 2 }))
      .mockReturnValue(of({ ...page, results: [{ ...university, id: 2 }], count: 2 }));
    component.browse();
    await vi.waitFor(() => expect(component.universities()).toHaveLength(1));
    component.loadMore();
    await vi.waitFor(() => expect(component.universities()).toHaveLength(2));
    expect(search).toHaveBeenLastCalledWith("", 1);
    component.setDisabledState(true);
    component.browse();
    fixture.detectChanges();
    expect(component.open()).toBe(false);
    expect(fixture.nativeElement.querySelector("input").disabled).toBe(true);
  });
});
