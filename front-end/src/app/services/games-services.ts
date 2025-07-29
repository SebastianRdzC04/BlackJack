import { Injectable } from '@angular/core';
import { CreateGameResponse, GetGameResponse, JoinGameResponse } from '../models/game.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GamesServices {
  private http = inject(HttpClient);
  private gameId = localStorage.getItem('gameId') || '';

  createGame(): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${environment.apiUrl}games`, {});
  }

  getGame(): Observable<GetGameResponse> {
    return this.http.get<GetGameResponse>(`${environment.apiUrl}games/${this.gameId}`);
  }

  joinGame(joinCode: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${environment.apiUrl}games/join/${joinCode}`, {});
  }

  startGame(): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${environment.apiUrl}games/start/${this.gameId}`, {});
  }


}
  
