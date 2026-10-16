/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SnackbarComponent } from "./snackbar.component";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { provideNoopAnimations } from "@angular/platform-browser/animations";

describe("SnackbarComponent", () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("закрывает постоянное уведомление кнопкой и не удаляет соседние сообщения", () => {
    const service = TestBed.inject(SnackbarService);
    service.error("Чат недоступен", { timeout: 0, dismissible: true });
    service.info("Другое сообщение", { timeout: 0 });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Закрыть уведомление"]').click();
    fixture.detectChanges();
    expect(component.snacks.map(snack => snack.text)).toEqual(["Другое сообщение"]);
  });

  it("убирает нужное уведомление по восстановлению соединения", () => {
    const service = TestBed.inject(SnackbarService);
    const id = service.error("Чат недоступен", { timeout: 0, dismissible: true });
    service.info("Другое сообщение", { timeout: 0 });
    service.dismiss(id);
    fixture.detectChanges();
    expect(component.snacks.map(snack => snack.text)).toEqual(["Другое сообщение"]);
  });
});
