/** @format */

import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ChatMessage } from "@models/chat-message.model";
import { User } from "@auth/models/user.model";
import { map, Observable } from "rxjs";
import { Project } from "@models/project.model";
import { numWord } from "@utils/num-word";
import { NavService } from "@services/nav.service";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ProjectChatComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute
  ) {
    this.messageForm = this.fb.group({
      messageControl: [{ text: "", filesUrl: [] }],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");

    this.messageForm.valueChanges.subscribe(console.log);
    // const ws = new WebSocket(
    //   environment.websocketUrl + `/chat/?token=${localStorage.getItem("accessToken")}`
    // );
    // ws.onopen = event => {
    //   console.log(event);

    // ws.send(
    //   JSON.stringify({
    //     type: "set_online",
    //     content: {
    // chat_type: "project",
    // chat_id: "120",
    // message: "some info",
    // reply_to: null,
    // },
    // })
    // );

    // ws.onmessage = message => {
    //   console.log(message);
    // };
    // };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.viewport?.scrollToIndex(9999999);
    });
  }

  project$: Observable<Project> = this.route.data.pipe(map(r => r["data"]));

  messageForm: FormGroup;

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  messagesElHeight = "0px";

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

  members: User[] = [
    User.default(),
    User.default(),
    User.default(),
    User.default(),
    User.default(),
    User.default(),
    User.default(),
  ];

  membersOnlineCount = 3;

  onInputResize(): void {
    if (this.viewport?.getOffsetToRenderedContentStart()) this.viewport?.scrollToIndex(99999);
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
