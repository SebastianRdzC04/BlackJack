import type { ICard } from "./card.model";
import type { IUser } from "./user.model";
import { IPlayerDeckWithPlayer } from "./playerDeck.model";



export interface IGame {
  _id: string;
  owner: number;
  deck?: ICard[];
  players: IUser[];
  is_active: boolean;
  turn: number;
  winner: string | null;
  joinCode: string;
  isFinished: boolean;
}


export interface CreateGameResponse {
    message: string;
    data: {
        game: IGame;
    }
}

export interface JoinGameResponse {
  message: string;
  data: {
    game: IGame;
  };
}

export interface GetGameResponse {
  message: string;
  data: {
    isOwner: boolean;
    game: IGame;
    playersDecks: IPlayerDeckWithPlayer[];
  }
}