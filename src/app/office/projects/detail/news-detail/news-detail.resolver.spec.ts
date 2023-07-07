import { TestBed } from '@angular/core/testing';

import { NewsDetailResolver } from './news-detail.resolver';

describe('NewsDetailResolver', () => {
  let resolver: NewsDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(NewsDetailResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
