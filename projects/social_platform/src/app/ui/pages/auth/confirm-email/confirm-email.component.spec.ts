/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmEmailComponent } from "./confirm-email.component";
import { AuthService } from "../../../../auth/services";
import { RouterTestingModule } from "@angular/router/testing";

describe("ConfirmEmailComponent", () => {
  let component: ConfirmEmailComponent;
  let fixture: ComponentFixture<ConfirmEmailComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj(["getTokens", "memTokens"]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ConfirmEmailComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
