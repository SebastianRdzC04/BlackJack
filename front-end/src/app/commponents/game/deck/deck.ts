import { Component, computed, input } from '@angular/core';
import { ICard } from '../../../models/card.model';
import { Card } from '../card/card';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-deck',
  imports: [CommonModule, Card],
  templateUrl: './deck.html',
  styleUrl: './deck.css'
})
export class Deck {
  deck = input<ICard[]>();

  anonimous = input<boolean>(false);

  length = computed(() => this.deck()?.length?? 0);


  getCardAtIndex(index: number): ICard | undefined {
    return this.deck()?.[index];
  }



}

