import { TestBed } from '@angular/core/testing';

import { ChatDirectService } from './chat-direct.service';

describe('ChatDirectService', () => {
  let service: ChatDirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatDirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
