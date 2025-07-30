import { Routes } from '@angular/router';
import { Authenticate } from './pages/authenticate/authenticate';
import { Index } from './pages/index';
import { noAuthGuard } from './guards/no-auth-guard';
import { authGuard } from './guards/auth-guard';
import { isGameValidGuard } from './guards/is-game-valid-guard';
import { Game } from './pages/game/game';

export const routes: Routes = [
    {
        path: 'auth',
        component: Authenticate,
        canActivate: [noAuthGuard] // Prevent authenticated users from accessing the auth page
    },
    {
        path: '',
        component: Index,
        canActivate: [authGuard] // Protect the index page for authenticated users
    },
    {
        path: 'game/:gameId',
        component: Game,
        canActivate: [authGuard, isGameValidGuard] // Protect the game page for authenticated users
    }
];

