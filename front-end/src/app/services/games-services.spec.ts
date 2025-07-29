import { TestBed } from '@angular/core/testing';

import { GamesServices } from './games-services';

describe('GamesServices', () => {
  let service: GamesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
