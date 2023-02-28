/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectChatComponent } from "./chat.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MessageInputComponent } from "@office/shared/message-input/message-input.component";

describe("ChatComponent", () => {
  let component: ProjectChatComponent;
  let fixture: ComponentFixture<ProjectChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectChatComponent, MessageInputComponent],
      imports: [ReactiveFormsModule],
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
