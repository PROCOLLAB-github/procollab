import { TestBed } from '@angular/core/testing';

import { ChatDirectResolver } from './chat-direct.resolver';

describe('ChatDirectResolver', () => {
  let resolver: ChatDirectResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ChatDirectResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
