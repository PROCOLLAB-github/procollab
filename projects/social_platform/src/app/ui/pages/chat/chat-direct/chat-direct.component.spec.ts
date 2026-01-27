/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatDirectComponent } from "./chat-direct/chat-direct.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgxMaskModule } from "ngx-mask";

describe("ChatDirectComponent", () => {
  let component: ChatDirectComponent;
  let fixture: ComponentFixture<ChatDirectComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ChatDirectComponent,
        NgxMaskModule.forRoot(),
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
