/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImgCardComponent } from "./img-card.component";

describe("FileCardComponent", () => {
  let component: ImgCardComponent;
  let fixture: ComponentFixture<ImgCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ImgCardComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
