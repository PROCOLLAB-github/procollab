/** @format */

import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ChatMessage } from "@models/chat-message.model";
import { map, noop, Observable } from "rxjs";
import { Project } from "@models/project.model";
import { numWord } from "@utils/num-word";
import { NavService } from "@services/nav.service";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@auth/services";
import { ModalService } from "@ui/models/modal.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ProjectChatComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly modalService: ModalService
  ) {
    this.messageForm = this.fb.group({
      messageControl: [{ text: "", filesUrl: [] }],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewport?.scrollToIndex(9999999);
    });
  }

  project$: Observable<Project> = this.route.data.pipe(map(r => r["data"]));

  currentUserId$: Observable<number> = this.authService.profile.pipe(map(r => r["id"]));
  messageForm: FormGroup;

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  messages: ChatMessage[] = (() => {
    const res = [];
    for (let i = 0; i < 10; i++) {
      res.push(ChatMessage.default());
    }
    return res;
  })();

  pularize = numWord;

  editingMessage?: ChatMessage;
  replyMessage?: ChatMessage;

  membersOnlineCount = 3;

  onInputResize(): void {
    if (this.viewport?.getOffsetToRenderedContentStart()) this.viewport?.scrollToIndex(99999);
  }

  onDeleteMessage(messageId: number): void {
    const deletedMessage = this.messages.find(message => message.id === messageId);

    this.modalService
      .confirmDelete("Вы уверены что хотите удалить сообщение?", `“${deletedMessage?.content}”`)
      .subscribe(noop);
  }

  onEditMessage(messageId: number): void {
    this.replyMessage = undefined;
    this.editingMessage = this.messages.find(message => message.id === messageId);
  }

  onReplyMessage(messageId: number): void {
    this.editingMessage = undefined;
    this.replyMessage = this.messages.find(message => message.id === messageId);
  }

  onCancelInput(): void {
    this.replyMessage = undefined;
    this.editingMessage = undefined;
  }
}
