/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveSetOfflineUseCase } from "./observe-set-offline.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnChangeStatus } from "@domain/chat/chat.model";

describe("ObserveSetOfflineUseCase", () => {
  let useCase: ObserveSetOfflineUseCase;
  let rt: any;
  let subject: Subject<OnChangeStatus>;

  function setup(): void {
    subject = new Subject();
    rt = { onSetOffline: vi.fn() };
    rt.onSetOffline.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveSetOfflineUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveSetOfflineUseCase);
  }

  it("делегирует в chatRealtime.onSetOffline", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onSetOffline).toHaveBeenCalledExactlyOnceWith();
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
