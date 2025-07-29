import { Injectable } from '@angular/core';
import { CreateGameResponse, GetGameResponse, JoinGameResponse } from '../models/game.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class GamesServices {
  private http = inject(HttpClient);
  private gameId = localStorage.getItem('gameId') || '';
  private socket: Socket | null = null;

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

  connectWebSocket(): Observable<any> {
    if (!this.socket) {
      this.socket = io(`${environment.wsUrl}`);
      this.socket.emit('join', this.gameId);
    }
    return new Observable(observer => {
      this.socket!.on('gameNotify', (data: any) => {
        observer.next(data);
      });

      return () => this.socket!.disconnect();
    });
  }

}
  
