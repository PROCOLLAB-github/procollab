/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveSetOnlineUseCase } from "./observe-set-online.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnChangeStatus } from "@domain/chat/chat.model";

describe("ObserveSetOnlineUseCase", () => {
  let useCase: ObserveSetOnlineUseCase;
  let rt: any;
  let subject: Subject<OnChangeStatus>;

  function setup(): void {
    subject = new Subject();
    rt = { onSetOnline: vi.fn() };
    rt.onSetOnline.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveSetOnlineUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveSetOnlineUseCase);
  }

  it("делегирует в chatRealtime.onSetOnline", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onSetOnline).toHaveBeenCalledExactlyOnceWith();
  });

  it("пробрасывает события из observable", () =>
    new Promise<void>(done => {
      setup();
      const event: OnChangeStatus = { userId: 5 } as OnChangeStatus;

      useCase.execute().subscribe(e => {
        expect(e).toBe(event);
        done();
      });

      subject.next(event);
    }));
});
