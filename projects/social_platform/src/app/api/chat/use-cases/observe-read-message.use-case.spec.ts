/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveReadMessageUseCase } from "./observe-read-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnReadChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveReadMessageUseCase", () => {
  let useCase: ObserveReadMessageUseCase;
  let rt: any;
  let subject: Subject<OnReadChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = { onReadMessage: vi.fn() };
    rt.onReadMessage.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveReadMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveReadMessageUseCase);
  }

  it("делегирует в chatRealtime.onReadMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onReadMessage).toHaveBeenCalledExactlyOnceWith();
  });

  it("пробрасывает события из observable", () =>
    new Promise<void>(done => {
      setup();
      const event: OnReadChatMessageDto = {
        chatType: "project",
        chatId: "1",
        messageId: 42,
        userId: 5,
      };

      useCase.execute().subscribe(e => {
        expect(e).toBe(event);
        done();
      });

      subject.next(event);
    }));
});
