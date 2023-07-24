import { TestBed } from '@angular/core/testing';

import { ProgramNewsService } from './program-news.service';

describe('ProgramNewsService', () => {
  let service: ProgramNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramNewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
