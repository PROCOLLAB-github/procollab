/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarControlComponent } from "./avatar-control.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("AvatarControlComponent", () => {
  let component: AvatarControlComponent;
  let fixture: ComponentFixture<AvatarControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AvatarControlComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
