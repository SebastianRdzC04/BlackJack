import type { HttpContext } from '@adonisjs/core/http'
import { Game } from '../mongo_models/game.js'
import { Card } from '../mongo_models/cards.js'
import { PlayerDeck } from '../mongo_models/player_deck.js'
import User from '#models/user'
import mongoose from 'mongoose';
import { io } from '#start/socket'


interface ICard {
  _id: mongoose.Types.ObjectId;
  suit: string;
  rank: string;
}

const shuffleDeck = async(): Promise<ICard[]> => {
  const cards = await Card.find({});
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards as ICard[];
}

const generateJoinCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let joinCode = '';
  for (let i = 0; i < 6; i++) {
    joinCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return joinCode;
}

interface IGame {
  _id: mongoose.Types.ObjectId;
  owner: number;
  deck: mongoose.Types.ObjectId[];
  players: number[];
  is_active: boolean;
  turn: number;
  winner: number | null;
  joinCode: string;
  isFinished: boolean;
}

const startGame = async (gameId: string): Promise<IGame> => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  const suffleCards = await shuffleDeck();
  if (suffleCards.length < 52) {
    throw new Error('Deck must contain exactly 52 cards');
  }

  game.deck = suffleCards.map(card => card._id);

  const playerDecks = await PlayerDeck.find({ gameId: game._id });
  for (const playerDeck of playerDecks) {
    playerDeck.deck = [];
    playerDeck.count = 0;
    playerDeck.totalValue = 0;
    await playerDeck.save();
  }
  game.is_active = true;
  game.turn = 0;
  game.winner = null;

  for (const playerDeck of playerDecks) {
    const cardsToGive = [];
    for (let i = 0; i < 2; i++) {
      const card = game.deck.pop();
      if (card) {
        cardsToGive.push(card);
      }
    }
    if (cardsToGive.length === 0) {
      throw new Error('Not enough cards in the deck to start the game');
    }
    const cards = await Card.find({ _id: { $in: cardsToGive } });
    playerDeck.deck = cardsToGive;
    playerDeck.count = cardsToGive.length;
    playerDeck.totalValue = cards.reduce((sum, card) => sum + (card.value ?? 0), 0);

    await playerDeck.save();
  }

  await game.save();
  return game as IGame;
}




export default class GamesController {


  async getGame({params, auth, response}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const gameId = params.id;

    const game = await Game.findById(gameId).populate('deck');




    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }

    const playersDecks = await PlayerDeck.find({ gameId: game._id }).populate('deck');
    if (!playersDecks) {
      return response.notFound({
        message: 'No player decks found for this game'
      });
    }

    if (!game.players.includes(user.id)) {
      return response.forbidden({
        message: 'You are not part of this game'
      });
    }


    const playersData = await User.query().whereIn('id', game.players)
    const playersDecksWithData = [];

    for (const playerDeck of playersDecks) {
      const user = await User.findBy('id', playerDeck.playerId);
      const playerDeckData = {
        ...playerDeck.toObject(),
        player: user
      }
      playersDecksWithData.push(playerDeckData);
    }


    const isPlayerTurn = game.turn === game.players.indexOf(user.id);

    const winnerData = game.winner ? await User.findBy('id', game.winner) : null;



    if (game.owner === user.id) {
      const gameObject = game.toObject();
      const gameWithData = {
        ...gameObject,
        players: playersData,
        winner: winnerData
      };

      return response.ok({
        message: 'Game retrieved successfully',
        data: {
          isOwner: game.owner === user.id,
          game: gameWithData,
          playersDecks: playersDecksWithData,
          isYourTurn: isPlayerTurn
        }
      });
    }else {
      const playerDeck = playersDecks.find(deck => deck.playerId === user.id);
      if (!playerDeck) {
        return response.notFound({
          message: 'Player deck not found for this user'
        });
      }

      const gameObject = game.toObject();
      const gameWithoutDeck = {
        ...gameObject,
        deck: undefined, // Exclude the deck from the response
        players: playersData,
        winner: winnerData
      }
      return response.ok({
        message: 'Game retrieved successfully',
        data: {
          isOwner: game.owner === user.id,
          game: gameWithoutDeck,
          playersDecks: playersDecksWithData.filter(deck => deck.playerId === user.id),
          isYourTurn: isPlayerTurn,
        }
      });
    }
  }
  
  async createGame({auth, response}: HttpContext) {
    const user = await auth.use('api').authenticate()
    const cards = await shuffleDeck();

    if (cards.length !== 52) {
      return response.badRequest({
        message: 'Deck must contain exactly 52 cards'
      });
    }


    const game = new Game({
      owner: user.id,
      deck: cards.map(card => card._id),
      players: [user.id],
      is_active: false,
      turn: 0,
      winner: null,
      joinCode: generateJoinCode()
    })
    await game.save();
    

    const playerDeck = new PlayerDeck({
      playerId: user.id,
      gameId: game._id,
      deck: [],
      count: 0,
      totalValue: 0,
      isReady: false
    })

    await playerDeck.save();

    const gameCreated = await Game.findById(game._id).populate('deck');

    if (!gameCreated) {
      return response.internalServerError({
        message: 'Error creating game'
      });
    }


    const playersData = await User.query().whereIn('id', gameCreated.players);
    const gameWithData = {
      ...gameCreated.toObject(),
      players: playersData
    }

    return response.created({
      message: 'Game created successfully',
      data: {
        game: gameWithData
      }
    })
  }

  async viewDeck({params, response}: HttpContext) {
    const gameId = params.id;
    const game = await Game.findById(gameId).populate('deck');

    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }

    return response.ok({
      message: 'Deck retrieved successfully',
      data: {
        deck: game.deck,
        count: game.deck.length
      }
    });
  }

  async joinGame({params, auth, response}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const gameCode = params.code;

    const game = await Game.findOne({ joinCode: gameCode });
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (game.players.includes(user.id)) {
      return response.badRequest({
        message: 'You are already in this game'
      });
    }
    if (game.players.length >= 7) {
      return response.badRequest({
        message: 'Game is full'
      });
    }
    if (game.is_active) {
      return response.badRequest({
        message: 'Game is already active'
      });
    }
    if (game.isFinished) {
      return response.badRequest({
        message: 'Game has already finished'
      });
    }

    game.players.push(user.id);
    const playerDeck = new PlayerDeck({
      playerId: user.id,
      gameId: game._id,
      deck: [],
      count: 0
    });
    await playerDeck.save();

    await game.save();

    const gameUpdated = await Game.findById(game._id);
    if (!gameUpdated) {
      return response.internalServerError({
        message: 'Error updating game'
      });
    }
    const playersData = await User.query().whereIn('id', gameUpdated.players);

    const gameWithoutDeck = {
      ...gameUpdated.toObject(),
      deck: undefined, // Exclude the deck from the response
      players: playersData
    }

    // Notify all sockets in the game room
    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });

    return response.ok({
      message: 'Joined game successfully',
      data: {
        game: gameWithoutDeck
      }
    });
  }

  async startGame({params, response, auth}: HttpContext) {
    const gameId = params.id;
    const game = await Game.findById(gameId);
    const user = await auth.use('api').authenticate();
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (game.is_active) {
      return response.badRequest({
        message: 'Game is already active'
      });
    }
    if (game.players.length < 2) {
      return response.badRequest({
        message: 'Not enough players to start the game'
      });
    }
    if (game.owner !== user.id) {
      return response.forbidden({
        message: 'Only the game owner can start the game'
      });
    }

    const playerDecks = await PlayerDeck.find({ gameId: game._id }).populate('deck');
    for (const playerDeck of playerDecks) {
      if (!playerDeck.isReady) {
        return response.badRequest({
          message: 'All players must be ready to start the game'
        });
      }
    }
    game.is_active = true;
    game.turn = 0;

    for (const playerDeck of playerDecks) {
      const cardsToGive = [];
      for (let i = 0; i < 2; i++) {
        const card = game.deck.pop();
        if (card) {
          cardsToGive.push(card);
        }
      }
      if (cardsToGive.length === 0) {
        return response.badRequest({
          message: 'Not enough cards in the deck to start the game'
        });
      }
      const cards = await Card.find({ _id: { $in: cardsToGive } });
      playerDeck.deck = cardsToGive;
      playerDeck.count = cardsToGive.length;
      playerDeck.totalValue = cards.reduce((sum, card) => sum + (card.value ?? 0), 0);

      await playerDeck.save();
    }

    await game.save();

    const gameStarted = await Game.findById(game._id).populate('deck');
    if (!gameStarted) {
      return response.internalServerError({
        message: 'Error starting game'
      });
    }

    const playersData = await User.query().whereIn('id', gameStarted.players);
    const gameWithData = {
      ...gameStarted.toObject(),
      players: playersData
    }
    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });


    return response.ok({
      message: 'Game started successfully',
      data: {
        game: gameWithData,
      }
    });
  }

  async leaveGame({params, auth, response}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const gameId = params.id;

    const game = await Game.findById(gameId);
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }

    if (!game.is_active) {
      return response.badRequest({
        message: 'Game is not active'
      });
    }

    if (!game.players.includes(user.id)) {
      return response.badRequest({
        message: 'You are not in this game'
      });
    }

    const playerIsOwner = game.owner === user.id;
    if (playerIsOwner) {
      //delete the game if the owner leaves
      game.set({ isFinished: true });
      await game.save();
    }


    game.players = game.players.filter(playerId => playerId !== user.id);
    game.is_active = false;
    await game.save();

    io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });

    await PlayerDeck.deleteMany({ playerId: user.id, gameId: game._id });
    return response.ok({
      message: 'Left game successfully',
      data: game
    });

  }

  async restartGame({params, auth, response}: HttpContext) {
    const user = await auth.use('api').authenticate();
    const gameId = params.id;

    const game = await Game.findById(gameId);
    if (!game) {
      return response.notFound({
        message: 'Game not found'
      });
    }
    if (game.winner === null) {
      return response.badRequest({
        message: 'Game is not finished yet'
      });
    }

    if (game.owner !== user.id) {
      return response.forbidden({
        message: 'Only the game owner can restart the game'
      });
    }

    if (game.players.length < 2) {
      return response.badRequest({
        message: 'Not enough players to restart the game'
      });
    }

    const playerDecks = await PlayerDeck.find({ gameId: game._id }).populate('deck');
    for (const playerDeck of playerDecks) {
      if (!playerDeck.isReady) {
        return response.badRequest({
          message: 'All players must be ready to start the game'
        });
      }
    }

    try {
      const gameRestarted = await startGame(gameId);
      if (!gameRestarted) {
        return response.internalServerError({
          message: 'Error restarting game'
        });
      }
      io.to(`game:${game._id}`).emit('gameNotify', { game: game._id });

      return response.ok({
        message: 'Game restarted successfully',
        data: gameRestarted
      });

    } catch (error) {
      return response.internalServerError({
        message: 'Error restarting game',
        error: error.message
      });
    }
  }
}
