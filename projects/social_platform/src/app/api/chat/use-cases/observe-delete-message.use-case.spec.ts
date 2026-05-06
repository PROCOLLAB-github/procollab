/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveDeleteMessageUseCase } from "./observe-delete-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnDeleteChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveDeleteMessageUseCase", () => {
  let useCase: ObserveDeleteMessageUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;
  let subject: Subject<OnDeleteChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["onDeleteMessage"]);
    rt.onDeleteMessage.and.returnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveDeleteMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveDeleteMessageUseCase);
  }

  it("делегирует в chatRealtime.onDeleteMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onDeleteMessage).toHaveBeenCalledOnceWith();
  });

  it("пробрасывает события из observable", done => {
    setup();
    const event: OnDeleteChatMessageDto = { chatType: "project", chatId: "1", messageId: 42 };

    useCase.execute().subscribe(e => {
      expect(e).toBe(event);
      done();
    });

    subject.next(event);
  });
});
