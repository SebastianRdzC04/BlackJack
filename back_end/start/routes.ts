/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import GamesController from '#controllers/games_controller'
import PlayerDecksController from '#controllers/player_decks_controller'
import { middleware } from './kernel.js'


router.post('/login', [AuthController, 'login'])
router.post('/register', [AuthController, 'register'])
router.get('/me', [AuthController, 'me'])
router.post('/logout', [AuthController, 'logout'])



router.post('/games', [GamesController, 'createGame'])
router.get('/games/deck/:id', [GamesController, 'viewDeck'])
router.post('/games/join/:code', [GamesController, 'joinGame'])
router.post('/games/start/:id', [GamesController, 'startGame'])
router.post('/games/restart/:id', [GamesController, 'restartGame'])
router.post('/games/leave/:id', [GamesController, 'leaveGame']).use(middleware.auth({guards: ['api']}))
router.get('/games/:id', [GamesController, 'getGame']).use(middleware.auth({guards: ['api']}))



router.post('/player-decks/pedir-carta/:id', [PlayerDecksController, 'pedirCarta'])
router.post('/player-decks/ready/:id', [PlayerDecksController, 'estarListo'])
router.post('/player-decks/finish/:id', [PlayerDecksController, 'terminarTurno'])
router.post('/player-decks/blackjack/:id', [PlayerDecksController, 'blackJack'])
router.get('/player-decks/my-deck/:id', [PlayerDecksController, 'myDeck']).use(middleware.auth({guards: ['api']}))



router.get('/', async () => {
  return {
    hello: 'world',
  }
})
