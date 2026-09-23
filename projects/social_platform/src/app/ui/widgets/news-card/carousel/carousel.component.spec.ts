/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CarouselComponent } from "./carousel.component";

describe("CarouselComponent", () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("циклически листает несколько изображений из signal, безопасно обрабатывает пустой набор", () => {
    component.next();
    component.prev();
    expect(component.currentIndex).toBe(0);
    fixture.componentRef.setInput("images", ["/a.svg", "/b.svg"]);
    fixture.detectChanges();
    component.next();
    expect(component.currentIndex).toBe(1);
    component.next();
    expect(component.currentIndex).toBe(0);
    component.prev();
    expect(component.currentIndex).toBe(1);
    expect(component.fit()).toBe("cover");
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
