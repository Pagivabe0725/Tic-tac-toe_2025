import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialog } from './dialog';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogHandler } from '../../services/dialog-handler.service';
import { DialogStructure } from '../../utils/interfaces/dialog-structure.interface';
import { Store } from '@ngrx/store';
import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../../store/selectors/game-settings.selector';
import { DIALOG_CONTENT } from '../../utils/constants/dialog-content.constant';
import { FormTemplate } from '../../services/form-template.service';
import { FieldKey } from '../../utils/types/dialog-form-field-model.type';
import { By } from '@angular/platform-browser';
import { DialogContent } from '../../utils/types/dialog-content.type';
import { randomHexColor } from '../../utils/test/functions/random-values.function';

/**
 * @fileoverview
 * Unit tests for the Dialog component.
 *
 * This suite covers:
 * - HTML rendering tests: ensuring buttons for prebuilt and custom dialog content
 *   are displayed correctly according to the template definitions.
 * - Component method tests: verifying that internal functions such as onEscape,
 *   sendTrigger, and instantEmit interact correctly with the DialogHandler service.
 */

const testDialog: DialogStructure = {
  title: 'Test Dialog Title',
  content:
    'This is the main content of the test dialog, used for testing purposes.',
  buttons: [
    {
      button: 'accept', // assuming DialogButton type includes 'accept'
      name: 'Confirm',
      triggerValue: 'confirmed',
    },
    {
      button: 'reject', // assuming DialogButton type includes 'reject'
      name: 'Cancel',
      triggerValue: 'cancelled',
    },
    {
      button: 'trigger', // assuming DialogButton type includes 'trigger'
      name: 'More Info',
      // triggerValue is optional here
    },
  ],
};

describe('Dialog', () => {
  /** Instance of the Dialog component under test. */
  let component: Dialog;

  /** Angular testing fixture used to create and interact with the Dialog component. */
  let fixture: ComponentFixture<Dialog>;

  /** Service responsible for handling dialog actions and emitting events. */
  let dialogService: DialogHandler;

  /** Service providing form template definitions and button configurations for dialogs. */
  let templateService: FormTemplate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dialog, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({}),
        {
          provide: Store,
          useValue: {
            selectSignal: jasmine.createSpy().and.callFake((selector) => {
              switch (selector) {
                case selectGameHardness:
                  return signal(1);
                case selectGameOpponent:
                  return signal('computer');
                case selectGameSize:
                  return signal(3);
                default:
                  return signal(undefined);
              }
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dialog);
    component = fixture.componentInstance;

    dialogService = TestBed.inject(DialogHandler);
    templateService = TestBed.inject(FormTemplate);

    spyOnProperty(dialogService, 'dialogData', 'get').and.returnValue(
      testDialog
    );

    fixture.detectChanges();
  });

  /**
   * Contains tests that verify the HTML rendering of the Dialog component,
   * specifically the correct display of buttons for prebuilt and custom dialog content.
   */
  describe('HTML:', () => {
    /**
     * Verifies that the buttons of each prebuilt dialog template
     * are correctly rendered in the DOM.
     */
    it('Should render buttons correctly for each prebuilt dialog template', async () => {
      // Iterate through all valid dialog content items
      for (const content of DIALOG_CONTENT.filter(
        (element) => !['message', 'error', undefined].includes(element)
      )) {
        // Set the current dialog content in the service
        dialogService.actualContent = content;
        fixture.detectChanges();

        // Retrieve the expected buttons for this content from the template service
        const templateButtons = templateService.getButtonsByFieldKey(
          content as FieldKey
        );

        // Find all rendered buttons in the component template
        const viewButtons = fixture.debugElement.queryAll(
          By.css('.own-basic-button')
        );

        // Compare each rendered button with the expected template button
        for (let i = 0; i < viewButtons.length; i++) {
          const actualButtonText = (
            viewButtons[i].nativeElement as HTMLButtonElement
          ).innerText;

          expect(actualButtonText).toEqual(templateButtons![i].name);
        }
      }
    });

    /**
     * Verifies that buttons are rendered correctly for custom dialog content types,
     * specifically 'error' and 'message'.
     */
    it('Should render buttons correctly for custom dialog content', () => {
      for (const content of ['error', 'message'] as DialogContent[]) {
        // Set the current dialog content in the service
        dialogService.actualContent = content;

        // Find all rendered buttons in the component template
        const viewButtons = fixture.debugElement.queryAll(
          By.css('.own-basic-button')
        );

        // Compare each rendered button text with the expected button name
        for (let i = 0; i < viewButtons.length; i++) {
          const actualButtonText = (
            viewButtons[i].nativeElement as HTMLButtonElement
          ).innerText;

          expect(actualButtonText).toEqual(testDialog.buttons![i].name);
        }
      }
    });
  });

  /**
   * Contains tests for the Dialog component's methods,
   * verifying that internal functions correctly interact
   * with the DialogHandler service.
   */
  describe('Component methods:', () => {
    /**
     * Verifies that pressing the Escape key closes the dialog
     * by emitting the CLOSE_EVENT via DialogHandler.
     */
    it('[onEscape] should close the dialog when Escape is pressed', () => {
      // Arrange
      spyOn(dialogService, 'emitData');
      dialogService.actualContent = 'game_setting';

      fixture.detectChanges(); // registers HostListener

      // Act: dispatch Escape on document (IMPORTANT)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      // Assert
      expect(dialogService.emitData).toHaveBeenCalledOnceWith('CLOSE_EVENT');
    });

    it('[sendTrigger] should forward the trigger value to the dialog service', () => {
      spyOn(dialogService, 'trigger');
      const randomColor = randomHexColor();

      component['sendTrigger'](randomColor);

      expect(dialogService.trigger).toHaveBeenCalledOnceWith(randomColor);
    });

    /**
     * Verifies that instantEmit immediately emits the provided value
     * through the DialogHandler without additional processing.
     */
    it('[instantEmit] should immediately emit the given value via the dialog service', () => {
      spyOn(dialogService, 'emitData');

      component['instantEmit'](true);

      expect(dialogService.emitData).toHaveBeenCalledOnceWith(true);
    });
  });
});
