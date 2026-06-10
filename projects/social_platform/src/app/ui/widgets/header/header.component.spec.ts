/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HeaderComponent } from "./header.component";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const authInfoSpy = {
      profile: of(null),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, HeaderComponent],
      providers: [{ provide: AuthInfoService, useValue: authInfoSpy }],
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
