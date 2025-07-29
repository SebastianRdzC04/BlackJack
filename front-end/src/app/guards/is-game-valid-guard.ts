import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { GamesServices } from '../services/games-services';
import { GetGameResponse } from '../models/game.model';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

export const isGameValidGuard: CanActivateFn = (route, state) => {
  const gamesService = inject(GamesServices);
  const router = inject(Router);

  return gamesService.getGame().pipe(
    map((response: GetGameResponse) => {
      if (response.data.game) {
        return true; // Permite entrar
      } else {
        return router.createUrlTree(['']);
      }
    }),
    catchError(() => of(router.createUrlTree(['']))) // Si hay error, redirige a la raíz
  );
};
