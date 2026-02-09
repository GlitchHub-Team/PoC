import { TestBed } from '@angular/core/testing';

import { InMemoryDataService } from './in-memory-data.service';

describe('InMemoryDataServiceTs', () => {
  let service: InMemoryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
