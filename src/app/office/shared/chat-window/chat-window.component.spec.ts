/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatWindowComponent } from "./chat-window.component";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";
import { OfficeModule } from "@office/office.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgxMaskModule } from "ngx-mask";

describe("ChatWindowComponent", () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        NgxMaskModule.forRoot(),
        OfficeModule,
        ChatWindowComponent,
    ],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
