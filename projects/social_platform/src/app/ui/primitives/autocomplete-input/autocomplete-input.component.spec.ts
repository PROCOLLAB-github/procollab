/** @format */

import { TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { AutoCompleteInputComponent } from "./autocomplete-input.component";

describe("AutoCompleteInputComponent: последовательные запросы", () => {
  const skill = { id: 1, name: "Angular" };
  let fixture: ReturnType<typeof TestBed.createComponent<AutoCompleteInputComponent<any>>>;
  let component: AutoCompleteInputComponent<any>;
  let search: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [AutoCompleteInputComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(AutoCompleteInputComponent<any>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("fieldToDisplay", "name");
    fixture.componentRef.setInput("clearInputOnSelect", true);
    fixture.componentRef.setInput("suggestions", []);
    fixture.detectChanges();
    search = vi.fn();
    component.searchStart.subscribe(search);
  });
  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });
  function type(value: string) {
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = value;
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
  }

  it("повторяет тот же поиск после выбора и программной очистки", () => {
    type("ang");
    vi.advanceTimersByTime(300);
    fixture.componentRef.setInput("suggestions", [skill]);
    component.onUpdate(new Event("click"), skill);
    type("ang");
    vi.advanceTimersByTime(300);
    expect(search.mock.calls).toEqual([["ang"], ["ang"]]);
  });

  it("ответ старого запроса не открывает подсказку во время нового ввода", () => {
    type("ang");
    vi.advanceTimersByTime(300);
    type("rea");
    fixture.componentRef.setInput("suggestions", [skill]);
    expect(component.isOpen()).toBe(false);
    vi.advanceTimersByTime(300);
    expect(search.mock.calls).toEqual([["ang"], ["rea"]]);
  });

  it("быстрый ввод отправляет последний запрос; очистка блокирует поздний ответ", () => {
    type("a");
    vi.advanceTimersByTime(100);
    type("an");
    vi.advanceTimersByTime(100);
    type("ang");
    vi.advanceTimersByTime(300);
    expect(search.mock.calls).toEqual([["ang"]]);
    type("");
    fixture.componentRef.setInput("suggestions", [skill]);
    expect(component.isOpen()).toBe(false);
    expect(component.loading()).toBe(false);
  });
});
