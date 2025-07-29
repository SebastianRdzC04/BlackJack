import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ReadyPlayerResponse } from '../models/playerDeck.model';
import { Observable } from 'rxjs';
import { PedirCartaResponse } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerDeckServices {
  private http = inject(HttpClient);
  private gameId = localStorage.getItem('gameId') || '';

  setPlayerReady(): Observable<ReadyPlayerResponse> {
    return this.http.post<ReadyPlayerResponse>(`${environment.apiUrl}player-decks/ready/${this.gameId}`, {});
  }

  pedirCarta(): Observable<PedirCartaResponse> {
    return this.http.post<PedirCartaResponse>(`${environment.apiUrl}player-decks/pedir-carta/${this.gameId}`, {});
  }

  terminarTurno(): Observable<any> {
    return this.http.post(`${environment.apiUrl}player-decks/finish/${this.gameId}`, {});
  }

  restartGame(): Observable<any> {
    return this.http.post(`${environment.apiUrl}games/restart/${this.gameId}`, {});
  }

}


