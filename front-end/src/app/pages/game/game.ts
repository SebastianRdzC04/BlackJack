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

  playerDeck = computed(() => {
    if (!this.user || !this.playerDecks()) return null;
    return this.playerDecks().find(deck => deck.playerId === this.user.id) || null;
  });

  isOwner = computed(() => {
    return this.game()?.data.isOwner || false;
  });


  constructor() {
    effect(() => {
      this.gameService.getGame().subscribe((game) => {
        this.game.set(game);
        this.playerDecks.set(game.data.playersDecks);
        console.log('Game updated:', game);
        console.log('Player decks:', this.playerDecks());
      });
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


}
