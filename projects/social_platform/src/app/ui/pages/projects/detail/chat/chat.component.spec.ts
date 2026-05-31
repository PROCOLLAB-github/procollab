/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectChatComponent } from "./chat.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MessageInputComponent } from "@ui/widgets/message-input/message-input.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { of } from "rxjs";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { signal } from "@angular/core";
import { initial } from "@domain/shared/async-state";
import { ChatDirectInfoService } from "@api/chat/facades/chat-direct-info.service";
import { ChatDirectUIInfoService } from "@api/chat/facades/ui/chat-direct-ui-info.service";

describe("ChatComponent", () => {
  let component: ProjectChatComponent;
  let fixture: ComponentFixture<ProjectChatComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const chatDirectInfoServiceSpy = jasmine.createSpyObj("ChatDirectInfoService", [
      "initializationChatDirect",
      "initializationChatFiles",
      "destroy",
      "onFetchMessages",
      "onSubmitMessage",
      "onEditMessage",
      "onDeleteMessage",
    ]);

    const chatDirectUIInfoServiceSpy = {
      chatFiles: signal([]),
      currentUserId: signal(0),
      messages: signal([]),
      typingPersons: signal([]),
      isAsideMobileShown: signal(false),
      fetching: signal(false),
      onToggleMobileAside: jasmine.createSpy("onToggleMobileAside"),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        ProjectChatComponent,
        MessageInputComponent,
      ],
    })
      .overrideComponent(ProjectChatComponent, {
        remove: {
          providers: [ChatDirectInfoService, ChatDirectUIInfoService],
        },
        add: {
          providers: [
            { provide: ChatDirectInfoService, useValue: chatDirectInfoServiceSpy },
            { provide: ChatDirectUIInfoService, useValue: chatDirectUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
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
