/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectChatComponent } from "./chat.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MessageInputComponent } from "@ui/components/message-input/message-input.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";

describe("ChatComponent", () => {
  let component: ProjectChatComponent;
  let fixture: ComponentFixture<ProjectChatComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ProjectChatComponent,
        MessageInputComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
