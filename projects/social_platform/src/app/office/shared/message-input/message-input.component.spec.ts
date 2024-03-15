/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MessageInputComponent } from "./message-input.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "@auth/services";
import { NgxMaskModule } from "ngx-mask";

describe("MessageInputComponent", () => {
  let component: MessageInputComponent;
  let fixture: ComponentFixture<MessageInputComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["profile"]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MessageInputComponent, NgxMaskModule.forRoot()],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
