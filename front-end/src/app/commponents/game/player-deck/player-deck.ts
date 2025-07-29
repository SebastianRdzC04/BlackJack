import { Component, input } from '@angular/core';
import { ICard } from '../../../models/card.model';
import { Deck } from '../deck/deck';
import { CommonModule } from '@angular/common';
import { IPlayerDeckWithPlayer } from '../../../models/playerDeck.model';
import { computed } from '@angular/core';
import { IUser } from '../../../models/user.model';



@Component({
  selector: 'app-player-deck',
  imports: [CommonModule, Deck],
  templateUrl: './player-deck.html',
  styleUrl: './player-deck.css'
})
export class PlayerDeck {

  playerDeck = input<IPlayerDeckWithPlayer>();
  cards = computed(() => this.playerDeck()?.deck);
  player = computed(() => this.playerDeck()?.player as IUser);

  ngOnInit() {
    console.log('Player deck initialized:', this.playerDeck());
    console.log('player fullname', this.player());
  }


}
