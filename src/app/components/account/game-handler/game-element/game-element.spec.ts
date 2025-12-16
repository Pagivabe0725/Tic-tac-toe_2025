import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameElement } from './game-element';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Http } from '../../../../services/http.service';
import { createGame } from '../../../../utils/test/functions/creators.functions';
import { SavedGame } from '../../../../utils/interfaces/saved-game.interface';
import { By } from '@angular/platform-browser';
import { generateRandomStatus } from '../../../../utils/test/functions/random-values.function';

/**
 * @fileoverview
 * Unit tests focusing on the GameElement component’s template rendering and method behavior.
 *
 * The tests verify:
 * - Correct display of game properties (name, size, updated timestamp) in the template
 * - Proper behavior of the `changeName` method, including guarding against unnecessary HTTP requests
 * - Correct HTTP request formation when a name change occurs
 * - Integration with Http service for game updates
 */

describe('GameElement', () => {
  /**
   * The GameElement component instance under test.
   * Provides access to methods and properties for unit testing.
   */
  let component: GameElement;

  /**
   * Angular test fixture for the GameElement component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<GameElement>;

  /**
   * A sample SavedGame object used as input for the GameElement component.
   * Represents the game data being rendered and manipulated during tests.
   */
  let savedGame: SavedGame;

  /**
   * Before each test, configure the testing module and create the component.
   * Also initialize a signal for the `gameDatas` input.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameElement, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Http, useFactory: () => new Http() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameElement);
    component = fixture.componentInstance;

    // Initialize gameDatas as an InputSignal
    const gameSignal = signal(createGame('1', '1', generateRandomStatus()));
    (component as any).gameDatas =
      gameSignal as unknown as InputSignal<SavedGame>;

    savedGame = gameSignal(); // Get the current game object
    fixture.detectChanges();
  });

  /**
   * HTML tests
   */
  describe('HTML:', () => {
    /**
     * Check that all divs with class `own-game-element-title-div`
     * contain the expected content: game name, size, and last updated timestamp.
     */
    it('Should display the correct content in all divs with the `own-game-element-title-div` class', () => {
      const contents: string[] = [
        savedGame.name,
        `${savedGame.size}X${savedGame.size}`,
        new Date(Number(savedGame.updatedAt)).toLocaleString(),
      ];

      const containers = fixture.debugElement.queryAll(
        By.css('.own-game-element-title-div')
      );

      for (let i = 0; i < containers.length; i++) {
        const span = containers[i].queryAll(By.css('span'))[1]
          .nativeElement as HTMLSpanElement;
        expect(span.innerHTML).toEqual(contents[i]);
      }
    });
  });

  /**
   * Tests for component methods
   */
  describe('Component methods:', () => {
    /**
     * Http service instance used to spy on and mock network requests made by the component.
     */
    let httpService: Http;

    beforeEach(() => {
      httpService = TestBed.inject(Http);
      spyOn(httpService, 'request'); // Spy on the HTTP request method
    });

    /**
     * Test the changeName method:
     * If the old name and new name are identical, the HTTP request should not be made.
     */
    it('[changeName] should not proceed if `oldName` equals `newName`', () => {
      component['changeName']('Test Game');
      expect(httpService.request).not.toHaveBeenCalled();
    });

    /**
     * Test the changeName method:
     * If the old name and new name differ, the HTTP request should be called
     * with the correct GraphQL mutation and variables.
     */
    it('[changeName] should proceed if `oldName` not equals `newName`', () => {
      const newName = 'New Test Game';
      component['changeName'](newName);

      const body = {
        query: `
        mutation UpdateGame($gameId: ID!, $name: String) {
          updateGame(gameId: $gameId, name: $name) {
            gameId
            name
          }
        }
      `,
        variables: {
          gameId: savedGame.gameId,
          name: newName,
        },
      };

      expect(httpService.request).toHaveBeenCalledOnceWith(
        'post',
        'graphql/game',
        body,
        {
          maxRetries: 3,
          initialDelay: 200,
        }
      );
    });
  });
});
