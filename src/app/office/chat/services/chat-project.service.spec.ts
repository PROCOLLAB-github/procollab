import { TestBed } from '@angular/core/testing';

import { ChatProjectService } from './chat-project.service';

describe('ChatProjectService', () => {
  let service: ChatProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
