import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ReadyPlayerResponse } from '../models/playerDeck.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerDeckServices {
  private http = inject(HttpClient);
  private gameId = localStorage.getItem('gameId') || '';

  setPlayerReady(): Observable<ReadyPlayerResponse> {
    return this.http.post<ReadyPlayerResponse>(`${environment.apiUrl}player-decks/ready/${this.gameId}`, {});
  }



}
