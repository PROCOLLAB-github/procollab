/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveMessagesUseCase } from "./observe-messages.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveMessagesUseCase", () => {
  let useCase: ObserveMessagesUseCase;
  let rt: any;
  let subject: Subject<OnChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = { onMessage: vi.fn() };
    rt.onMessage.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveMessagesUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveMessagesUseCase);
  }

  it("делегирует в chatRealtime.onMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onMessage).toHaveBeenCalledExactlyOnceWith();
  });

  it("пробрасывает события из observable", () =>
    new Promise<void>(done => {
      setup();
      const event = { chatId: "1" } as OnChatMessageDto;

      useCase.execute().subscribe(e => {
        expect(e).toBe(event);
        done();
      });

      subject.next(event);
    }));
});
