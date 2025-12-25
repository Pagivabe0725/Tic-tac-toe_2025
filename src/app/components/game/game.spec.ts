import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Game } from './game';
import {
  computed,
  provideZonelessChangeDetection,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import {
  selectActualBoard,
  selectActualMarkup,
  selectActualStep,
  selectGameResults,
  selectGameWinner,
  selectLastMove,
  selectPlayersSpentTimes,
  selectStarted,
} from '../../store/selectors/game-info.selector';
import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../../store/selectors/game-settings.selector';
import {
  randomBetween,
  randomNumber,
} from '../../utils/test/functions/random-values.function';
import { savedGameStatus } from '../../utils/types/game-status.type';
import { createGame } from '../../utils/test/functions/creators.functions';
import {
  getNextMarkup,
  getWinnerByGameStatus,
} from '../../utils/test/functions/helper.functions';
import { Auth } from '../../services/auth.service';
import { User } from '../../utils/interfaces/user.interface';
import { GameInfo } from '../../utils/interfaces/game-info.interface';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';

fdescribe('Game', () => {
  let fixture: ComponentFixture<Game>;
  let component: Game;
  let store: MockStore;
  let auth: Auth;

  beforeEach(async () => {
    const status: savedGameStatus = 'not_started';
    const game = createGame('game_Id1', 'userId_1', status);

    await TestBed.configureTestingModule({
      imports: [Game, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          initialState: {
            gameInfo: {
              actualBoard: game.board,
              actualStep: 1,
              lastMove: game.lastMove,
              started: false,
              results: {
                player_O_Lose: 0,
                player_X_Lose: 0,
                draw: 0,
                player_X_Win: 0,
                player_O_Win: 0,
              },
              playersSpentTimes: { player_O: 0, player_X: 0 },
              winner: null,
            },
            gameSettings: {
              hardness: 2,
              size: 3,
              opponent: game.opponent,
            },
          },
        }),
      ],
    });

    store = TestBed.inject(MockStore);
    auth = TestBed.inject(Auth);

    spyOnProperty(auth, 'user', 'get').and.returnValue(
      signal({
        userId: 'userId_1',
        email: 'test@gmail.com',
        game_count: 2,
        winNumber: 0,
        loseNumber: 0,
      }) as Signal<User | undefined>
    );

    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('`clickPermission` computed:', () => {
    afterEach(() => {
      fixture.destroy()
    });

    it('Should return false if winner is not null2', async () => {
      // Várakozás az aszinkron Signal frissítésre
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['clickPermission']()).toBe(false);
    });

    it('Should return false if winner is not null', async () => {
      // Várakozás az aszinkron Signal frissítésre
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['clickPermission']()).toBe(false);
    });

    it('Should return false if winner is not null3', async () => {
      // Várakozás az aszinkron Signal frissítésre
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['clickPermission']()).toBe(false);
    });
  });
});
