import { TestBed } from '@angular/core/testing';

import { PlayerDeckServices } from './player-deck-services';

describe('PlayerDeckServices', () => {
  let service: PlayerDeckServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerDeckServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
