/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ChatMessageComponent } from "./chat-message.component";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { of } from "rxjs";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { OverlayModule } from "@angular/cdk/overlay";
import { API_URL } from "@corelib";

describe("ChatMessageComponent", () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(async () => {
    const authSpy = {
      fetchProfile: of({ id: 1, firstName: "Test", lastName: "User" }),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({ results: [], count: 0 }),
    };

    await TestBed.configureTestingModule({
      imports: [OverlayModule, ChatMessageComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authSpy },
        { provide: API_URL, useValue: "" },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.chatMessage = {
      id: 1,
      author: {
        id: 1,
        firstName: "Test",
        lastName: "User",
        isOnline: false,
        relations: { isOnline: false, progress: 100 },
        personal: { avatar: "" },
        skills: [],
        specializations: [],
      },
      isEdited: false,
      isRead: false,
      isDeleted: false,
      replyTo: null,
      text: "",
      createdAt: "",
      files: [],
    } as unknown as ChatMessage;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
