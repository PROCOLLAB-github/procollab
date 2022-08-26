/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HeaderComponent } from "./header.component";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profileStream: of({}) }]);

    await TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [HeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
