import { TestBed } from '@angular/core/testing';

import { ChatGroupsResolver } from './chat-groups.resolver';

describe('ChatGroupsResolver', () => {
  let resolver: ChatGroupsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ChatGroupsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
