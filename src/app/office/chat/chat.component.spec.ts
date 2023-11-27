/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatComponent } from "./chat.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ChatComponent", () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, HttpClientTestingModule, ChatComponent],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
