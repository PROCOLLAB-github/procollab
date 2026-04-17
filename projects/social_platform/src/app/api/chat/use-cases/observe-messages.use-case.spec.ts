/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveMessagesUseCase } from "./observe-messages.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveMessagesUseCase", () => {
  let useCase: ObserveMessagesUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;
  let subject: Subject<OnChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["onMessage"]);
    rt.onMessage.and.returnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveMessagesUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveMessagesUseCase);
  }

  it("делегирует в chatRealtime.onMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onMessage).toHaveBeenCalledOnceWith();
  });

  it("пробрасывает события из observable", done => {
    setup();
    const event = { chatId: "1" } as OnChatMessageDto;

    useCase.execute().subscribe(e => {
      expect(e).toBe(event);
      done();
    });

    subject.next(event);
  });
});
