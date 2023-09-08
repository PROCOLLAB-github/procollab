import { TestBed } from '@angular/core/testing';

import { ChatResolver } from './chat.resolver';

describe('ChatResolver', () => {
  let resolver: ChatResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ChatResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
