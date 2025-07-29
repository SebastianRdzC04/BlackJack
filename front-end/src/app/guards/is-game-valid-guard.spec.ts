import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isGameValidGuard } from './is-game-valid-guard';

describe('isGameValidGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isGameValidGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
