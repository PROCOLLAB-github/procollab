/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveTypingUseCase } from "./observe-typing.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { TypingInChatEventDto } from "@domain/chat/chat.model";

describe("ObserveTypingUseCase", () => {
  let useCase: ObserveTypingUseCase;
  let rt: any;
  let subject: Subject<TypingInChatEventDto>;

  function setup(): void {
    subject = new Subject();
    rt = { onTyping: vi.fn() };
    rt.onTyping.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveTypingUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveTypingUseCase);
  }

  it("делегирует в chatRealtime.onTyping", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onTyping).toHaveBeenCalledExactlyOnceWith();
  });

  it("пробрасывает события из observable", () =>
    new Promise<void>(done => {
      setup();
      const event = {
        chatType: "project",
        chatId: "1",
        userId: 5,
        endTime: 0,
      } as TypingInChatEventDto;

      useCase.execute().subscribe(e => {
        expect(e).toBe(event);
        done();
      });

      subject.next(event);
    }));
});
