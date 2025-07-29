import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetGameResponse } from '../../models/game.model';
import { GamesServices } from '../../services/games-services';
import { inject } from '@angular/core';
import { PlayerDeck } from '../../commponents/game/player-deck/player-deck';
import { IPlayerDeckWithPlayer } from '../../models/playerDeck.model';
import { PlayerDeckServices } from '../../services/player-deck-services';


@Component({
  selector: 'app-game',
  imports: [CommonModule, PlayerDeck],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class Game {

  private gameService = inject(GamesServices);

  private playerDeckService = inject(PlayerDeckServices);

  user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  game = signal<GetGameResponse | null>(null);

  playerDecks = signal<IPlayerDeckWithPlayer[]>([]);

  gameIsActive = computed(() => {
    return this.game() && this.game()?.data.game.is_active || false;
  })

  readyToRestart = computed(() => {
    return this.game() && this.game()?.data.game.winner !== null || false;
  })

  playerDeck = computed(() => {
    if (!this.user || !this.playerDecks()) return null;
    return this.playerDecks().find(deck => deck.playerId === this.user.id) || null;
  });

  isOwner = computed(() => {
    return this.game()?.data.isOwner || false;
  });

  isYourTurn = computed(() => {
    return this.game()?.data.isYourTurn || false;
  });

  winner = computed(() => {
    console.log('Current game Winner:', this.game()?.data.game.winner);
    return this.game()?.data.game.winner || null;
  })


  constructor() {
    effect(() => {
      this.gameService.getGame().subscribe((game) => {
        this.game.set(game);
        this.playerDecks.set(game.data.playersDecks);
        console.log('Game updated:', game);
        console.log('Player decks:', this.playerDecks());
      });
    });

    this.gameService.connectWebSocket().subscribe({
      next: (data) => {
        this.gameService.getGame().subscribe((game) => {
          this.game.set(game);
          this.playerDecks.set(game.data.playersDecks);
          console.log('Game updated from WebSocket:', game);
          console.log('Player decks from WebSocket:', this.playerDecks());
        })
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      }
    })



  }

  restartGame() {

    if (!this.game() || !this.isOwner()) {
      console.log('You are not the owner of the game or the game is not available.');
      return;
    }

    if (!this.readyToRestart()) {
      console.log('Game is not ready to be restarted.');
      return;
    }

    this.playerDeckService.restartGame().subscribe({
      next: (response) => {
        console.log('Game restarted successfully:', response);
        // Update game state if necessary
      },
      error: (error) => {
        console.error('Error restarting game:', error);
      }
    });
  }


  playerReady() {
    if (!this.game() || !this.playerDeck()) return;

    this.playerDeckService.setPlayerReady().subscribe({
      next: (response) => {
        console.log('Player is ready:', response);
        this.playerDecks.set(this.playerDecks().map(deck => 
          deck.playerId === this.user?.id ? {...deck, isReady: true} : deck
        ));
      },
      error: (error) => {
        console.error('Error setting player ready:', error);
      }
    });

  }

  startGame() {
    this.gameService.startGame().subscribe({
      next: (response) => {
        console.log('Game started:', response);
      },
      error: (error) => {
        console.error('Error starting game:', error);
      }
    })
  }

  pedirCarta() {
    if (!this.game() || !this.playerDeck()) return;

    if (!this.isYourTurn()) {
      console.log('It is not your turn to request a card.');
      return;
    }



    this.playerDeckService.pedirCarta().subscribe({
      next: (response) => {
        console.log('Card requested:', response);
        // Update player deck with the new card
      },
      error: (error) => {
        console.error('Error requesting card:', error);
      }
    });
  }

  terminarTurno() {
    if (!this.game() || !this.playerDeck()) return;

    if (!this.isYourTurn()) {
      console.log('It is not your turn to finish.');
      return;
    }

    this.playerDeckService.terminarTurno().subscribe({
      next: (response) => {
        console.log('Turn ended successfully:', response);
        // Update game state if necessary
      },
      error: (error) => {
        console.error('Error ending turn:', error);
      }
    });
  }


}
