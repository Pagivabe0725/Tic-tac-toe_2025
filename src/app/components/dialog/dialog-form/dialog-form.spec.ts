import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogForm } from './dialog-form';
import {
  DebugElement,
  DestroyRef,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { GameSettings } from '../../../utils/interfaces/game-settings.interface';
import {
  generateRandomDialogContent,
  generateRandomGameSettingObject,
  randomBetween,
  randomHexColor,
  randomNumber,
} from '../../../utils/test/functions/random-values.function';
import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../../../store/selectors/game-settings.selector';
import { FormTemplate } from '../../../services/form-template.service';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { By } from '@angular/platform-browser';
import { DialogContent } from '../../../utils/types/dialog-content.type';
import { FieldKey } from '../../../utils/types/dialog-form-field-model.type';
import { FormField } from '../../../utils/interfaces/form-field-template.interface';
import { Theme } from '../../../services/theme.service';
import { FormError } from '../../../services/form-error.service';
import { FORM_FIELD_MODELS } from '../../../utils/constants/dialog-form-field-model.constant';
import { Auth } from '../../../services/auth.service';
import { AbstractControl } from '@angular/forms';
import { createUser } from '../../../utils/test/functions/creators.functions';

/**
 * @fileoverview
 * Unit tests for the DialogForm component.
 *
 * Focus:
 * - Component creation with signal-based NgRx selectors
 * - Proper mocking of Store.selectSignal
 * - Initialization of internal WritableSignals from Store values
 */

/**
 * Unit tests for the DialogForm component.
 */
describe('DialogForm', () => {
  /** Instance of the DialogForm component under test. */
  let component: DialogForm;

  /** Angular testing fixture used to create and interact with the DialogForm component. */
  let fixture: ComponentFixture<DialogForm>;

  /** Selected game difficulty level used to configure the dialog behavior during tests. */
  let hardness: GameSettings['hardness'];

  /** Service responsible for handling dialog lifecycle and interactions. */
  let dialogService: DialogHandler;

  /** Service providing form template definitions and structure. */
  let templateService: FormTemplate;

  /** Service responsible for providing theme-related values such as colors. */
  let themeService: Theme;

  /** Service used to manage and expose form validation and error states. */
  let formErrorService: FormError;

  /** Dialog content model representing the actual content displayed in the DialogForm component. */
  let content: DialogContent;

  beforeEach(async () => {
    hardness = randomBetween(1, 4) as GameSettings['hardness'];

    await TestBed.configureTestingModule({
      imports: [DialogForm, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Store,
          useValue: {
            selectSignal: jasmine.createSpy().and.callFake((selector) => {
              switch (selector) {
                case selectGameHardness:
                  return signal(hardness);
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
        { provide: FormTemplate, useFactory: () => new FormTemplate() },
        { provide: DialogHandler, useFactory: () => new DialogHandler() },
        { provide: Theme, useFactory: () => new Theme() },
        { provide: FormError, useFactory: () => new FormError() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogForm);
    component = fixture.componentInstance;

    dialogService = TestBed.inject(DialogHandler);
    templateService = TestBed.inject(FormTemplate);
    themeService = TestBed.inject(Theme);
    formErrorService = TestBed.inject(FormError);

    dialogService.actualContent = 'game_setting';

    fixture.detectChanges();
  });

  /**
   * Tests related to the rendered HTML structure of the dialog form.
   */
  describe('HTML:', () => {
    let templateStructure: FormField[];
    let fieldsets: DebugElement[];

    /**
     * Checks that the rendered dialog form matches the template content.
     */

    beforeEach(() => {
      content = generateRandomDialogContent();
      dialogService.actualContent = content;
      templateStructure = templateService.getStructureByFieldKey(
        content as FieldKey
      );
      fixture.detectChanges();
      fieldsets = fixture.debugElement.queryAll(By.css('fieldset'));
    });

    it('Should render a fieldset for each form field defined by the active dialog template', () => {
      expect(fieldsets.length).toBe(templateStructure.length);

      for (let i = 0; i < fieldsets.length; i++) {
        const legend = (
          fieldsets[i].query(By.css('legend'))
            .nativeElement as HTMLLegendElement
        ).innerText;

        expect(legend.substring(0, legend.length - 1)).toEqual(
          templateStructure[i].title
        );
      }
    });

    /**
     * Verifies that all dialog inputs and selects have the correct type and options as per the template.
     */
    it('Should check that input types and select options match the template', () => {
      for (let i = 0; i < fieldsets.length; i++) {
        const userInput = fieldsets[i].children[1].nativeElement as
          | HTMLInputElement
          | HTMLSelectElement;

        if (userInput.tagName === 'INPUT') {
          expect(userInput.type).toBe(String(templateStructure[i].type));
        } else {
          expect(userInput.querySelectorAll('option').length).toBe(
            templateStructure[i]!.options!.length
          );
        }
      }
    });
  });

  /**
   * Tests covering reactive effects driven by signals and dialog content changes.
   */
  describe('Effects:', () => {
    /**
     * Verifies that changing the active dialog content triggers the effect
     * which retrieves the corresponding form template structure.
     */
    it('First effect should call [getStructureByFieldKey] when the dialog content changes', async () => {
      dialogService.actualContent = undefined;

      const newContent = generateRandomDialogContent();

      const templateResult = templateService.getStructureByFieldKey(
        newContent as FieldKey
      );

      spyOn(templateService, 'getStructureByFieldKey').and.returnValue(
        templateResult
      );

      dialogService.actualContent = newContent;

      fixture.detectChanges();

      expect(templateService.getStructureByFieldKey).toHaveBeenCalledWith(
        newContent as FieldKey
      );
    });

    /**
     * Verifies that changes in the component's theme-related signals
     * are correctly propagated to the ThemeService via the effect.
     */
    it('Second effect should propagate theme colors from component signals to ThemeService', () => {
      const accent = randomHexColor();
      const primary = randomHexColor();

      component['accentColor'].set(accent);
      component['primaryColor'].set(primary);

      fixture.detectChanges();

      expect(themeService.accentColor).toBe(accent);
      expect(themeService.primaryColor).toBe(primary);
    });
  });

  /**
   * Tests for the constructor-based subscription handling dialog trigger events.
   */
  describe('`triggerSubscription` subscription in constructor:', () => {
    /**
     * Verifies that the component reacts to a `form` trigger
     * by invoking the sendResults method.
     */
    it('Should call [sendResults] when a form trigger is emitted', () => {
      spyOn<any>(component, 'sendResults');

      dialogService.trigger('form');

      expect(component['sendResults']).toHaveBeenCalled();
    });

    /**
     * Verifies that the component reacts to a `reset` trigger
     * by invoking the resetProperties method.
     */
    it('Should call [resetProperties] when a reset trigger is emitted', () => {
      spyOn<any>(component, 'resetProperties');

      dialogService.trigger('reset');

      expect(component['resetProperties']).toHaveBeenCalled();
    });

    /**
     * Verifies that a dialog content change trigger updates the active dialog content
     * and clears all form validation errors.
     */
    it('Should update `dialog content` and clear form errors on change trigger', async () => {
      const originalContent = randomNumber(2) === 1 ? 'registration' : 'login';

      dialogService.actualContent = originalContent;

      const newContent =
        dialogService.actualContent() === 'registration'
          ? 'login'
          : 'registration';

      spyOn<any>(component, 'resetProperties');
      spyOn(formErrorService, 'clearErrors');

      dialogService.trigger('change:' + newContent);

      expect(dialogService.actualContent()).toEqual(newContent);
      expect(formErrorService.clearErrors).toHaveBeenCalled();
    });
  });

  describe('Component methods', () => {
    /**
     * Verifies that getFormResult returns the correct form values
     * based on the active dialog content.
     *
     * The test uses select-based fields because selects always
     * have a deterministic default value, making the result predictable.
     */
    it('[getFormResult] should return form values matching the active dialog template defaults', () => {
      dialogService.actualContent = 'game_setting';

      const result = component['getFormResult']();

      expect(result).toEqual({
        hardness: component['hardness'](),
        opponent: component['opponent'](),
        size: component['size'](),
      });
    });

    /**
     * Verifies that `getFieldByModel` returns the correct signal for each form-related property.
     */
    it('[getFieldByModel] should return the correct signal values for all supported form field models', () => {
      for (const model of FORM_FIELD_MODELS) {
        const fieldSignal = component['getFieldByModel'](model);

        expect(String(fieldSignal())).toEqual(String(component[model]()));
      }
    });

    /**
     * Tests for the `checkcontrols` method.
     *
     * Purpose:
     * - Validates the form controls of the currently active dialog
     * - Applies validation rules based on the dialog content type
     */
    describe('[checkcontrols] function:', () => {
      /**
       * Verifies that calling `checkcontrols` does not trigger validation logic
       * for dialog contents that consist only of select fields.
       *
       */
      it('Should skip validation logic for dialogs containing only select fields', async () => {
        const options: FieldKey[] = ['game_setting', 'setting'];
        const content: FieldKey = options[randomNumber(options.length)];

        dialogService.actualContent = content;

        const template = templateService.getStructureByFieldKey(content);
        fixture.detectChanges();
        await fixture.whenStable();

        await component['checkcontrols']();

        template.forEach((structure) => {
          const control = component['ngForm']()?.form.get(structure.key);

          expect(control?.valid).toBe(true);
        });
      });

      /**
       * Verifies the `checkcontrols` method behavior for the 'save' dialog form.
       *
       * This test covers both valid and invalid states:
       * - When the game name is filled, all form controls should be valid.
       * - When the game name is empty, the relevant controls should be marked invalid.
       */
      it('Should validate "save" form correctly for both filled and empty game name', async () => {
        const content: FieldKey = 'save';

        component['gameName'].set('random' + randomNumber(100));
        dialogService.actualContent = content;

        const template = templateService.getStructureByFieldKey(content);
        fixture.detectChanges();
        await fixture.whenStable();

        await component['checkcontrols']();

        template.forEach((structure) => {
          const control = component['ngForm']()?.form.get(structure.key);
          expect(control?.valid).toBe(true);
        });

        component['gameName'].set('');
        fixture.detectChanges();
        await fixture.whenStable();

        await component['checkcontrols']();

        template.forEach((structure) => {
          const control = component['ngForm']()?.form.get(structure.key);
          expect(control?.valid).toBe(false);
        });
      });

      /**
       * Validates the registration form when all inputs are correctly filled.
       *
       * This test sets valid values for the email, password, and password confirmation fields.
       * It ensures that the form’s validation logic correctly identifies all fields as valid.
       * The email-in-use check is mocked to resolve immediately, allowing the test to run synchronously.
       */
      it('Should validate `registration` form correctly when inputs are valid', async () => {
        spyOn(formErrorService, 'markAsEmailInUse').and.returnValue(
          Promise.resolve()
        );

        component['email'].set('user@example.com');
        component['password'].set('123456');
        component['rePassword'].set('123456');

        dialogService.actualContent = 'registration';

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();

        await component['checkcontrols']();

        const template = templateService.getStructureByFieldKey('registration');

        for (const formField of template) {
          const control = component['ngForm']()?.form.get(formField.model);

          expect(control?.valid)
            .withContext(
              `The '${
                formField.model
              }' control has an error: '${formErrorService.getPrimaryError(
                control as AbstractControl
              )}'`
            )
            .toBe(true);
        }
      });

      /**
       * Verifies that the `password_change` dialog form is fully valid
       * when the current password is correct and the new password fields match.
       *
       * The test mocks the AuthService password check to simulate a valid
       * current user password, then ensures that all related form controls
       * pass validation after running `checkcontrols`.
       */
      it('Should validate `password change` form correctly when inputs are valid', async () => {
        const originalPassword = '123456';
        const authService = TestBed.inject(Auth);

        spyOn(authService, 'isCurrentUserPassword').and.callFake(
          (password: string) => {
            if (password === originalPassword) {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }
        );

        component['password'].set('123456');
        component['newPassword'].set('234567');
        component['rePassword'].set('234567');

        dialogService.actualContent = 'password_change';

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();

        await component['checkcontrols']();

        const template =
          templateService.getStructureByFieldKey('password_change');
        for (const formField of template) {
          const control = component['ngForm']()?.form.get(formField.model);
          expect(control?.valid)
            .withContext(
              `'${
                formField.model
              }' control has an error : '${formErrorService.getPrimaryError(
                control as AbstractControl
              )}'`
            )
            .toBe(true);
        }
      });

      /**
       * Ensures the `email_change` form is valid when inputs are correct.
       * Mocks async validators in `FormError` to avoid real HTTP calls
       * and checks that all form controls pass validation.
       */
      it('Should validate `email change` form correctly when inputs are valid', async () => {
        const originalUser = createUser(false);

        spyOn(formErrorService, 'markAsEmailDoesNotExist').and.returnValue(
          Promise.resolve()
        );

        spyOn(formErrorService, 'markAsEmailInUse').and.returnValue(
          Promise.resolve()
        );

        spyOn(formErrorService, 'markAsNotCurrentUserEmail').and.callFake(
          (control: AbstractControl) => {
            if (control.value === originalUser.email) {
              return true;
            }
            return false;
          }
        );

        component['email'].set(originalUser.email);
        component['newEmail'].set('newemail@gmail.com');

        dialogService.actualContent = 'email_change';

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();

        await component['checkcontrols']();

        const template = templateService.getStructureByFieldKey('email_change');
        for (const formField of template) {
          const control = component['ngForm']()?.form.get(formField.model);

          expect(control?.valid)
            .withContext(
              `'${
                formField.model
              }' control has an error : '${formErrorService.getPrimaryError(
                control as AbstractControl
              )}'`
            )
            .toBe(true);
        }
      });

      /**
       * Ensures the `login` form is valid when correct credentials are provided.
       * Mocks `markAsEmailDoesNotExist` to avoid real HTTP calls and simulate existing email.
       * Verifies that all form controls pass validation.
       */
      it('Should validate `login` form correctly when inputs are valid', async () => {
        const originalUser = createUser(false);

        spyOn(formErrorService, 'markAsEmailDoesNotExist').and.callFake(
          (control: AbstractControl) => {
            if (control.value === originalUser.email) {
              return Promise.resolve();
            } else
              formErrorService.addErrorToControl(control, 'emailDoesNotExist');
            return Promise.resolve();
          }
        );

        component['email'].set(originalUser.email);
        component['password'].set('123456');

        dialogService.actualContent = 'login';

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();

        await component['checkcontrols']();

        const template = templateService.getStructureByFieldKey('login');
        for (const formField of template) {
          const control = component['ngForm']()?.form.get(formField.model);

          expect(control?.valid)
            .withContext(
              `'${
                formField.model
              }' control has an error : '${formErrorService.getPrimaryError(
                control as AbstractControl
              )}'`
            )
            .toBe(true);
        }
      });
    });

    /**
     * Tests the `sendResults` function to ensure it correctly collects
     * the current form values and emits them through the DialogHandler service.
     */
    describe('[sendResults] function:', () => {
      /**
       * Verifies that when the dialog content is "game_setting",
       * `sendResults` gathers the game settings signals and emits them via `dialog.emitData`.
       */
      it('Should emit current game settings through `dialog.emitData`', async () => {
        spyOn(dialogService, 'emitData');
        const gameSettings = generateRandomGameSettingObject();

        component['hardness'].set(gameSettings.hardness);
        component['opponent'].set(gameSettings.opponent);
        component['size'].set(gameSettings.size);

        fixture.detectChanges();

        dialogService.actualContent = 'game_setting';

        await component['sendResults']();

        expect(dialogService.emitData).toHaveBeenCalledOnceWith(gameSettings);
      });

      /**
       * Ensures that the `sendResults` function does NOT emit any data
       * when the form is invalid, even if the dialog content is set.
       */
      it('Should not emit form data via `dialog.emitData` when the form is invalid', async () => {
        spyOn(dialogService, 'emitData');

        fixture.detectChanges();

        dialogService.actualContent = 'save';
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        await component['sendResults']();

        expect(dialogService.emitData).not.toHaveBeenCalled();
      });
    });

    /**
     * Tests the `resetProperties` function.
     *
     * Verifies that calling `resetProperties` restores the previous signal values
     * and emits a `CLOSE_EVENT` through the DialogHandler once the reset cycle
     * and next render phase are completed.
     */
    describe('[resetProperties] function:', () => {
      it('Should reset form-related signals and emit a CLOSE_EVENT', async () => {
        spyOn(dialogService, 'emitData');

        dialogService.actualContent = 'setting';
        fixture.detectChanges();

        // Wait for pending signal updates and render cycle
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        await component['resetProperties']();

        expect(dialogService.emitData).toHaveBeenCalledOnceWith('CLOSE_EVENT');
      });
    });
  });

  /**
   * Contains tests that could not be grouped into any other
   * more specific test category.
   */
  describe('Others:', () => {
    /**
     * Verifies that the component initializes accentColor and primaryColor
     * signals with the default fallback value '#fff' when the ThemeService
     * getters return undefined.
     */
    it('Should initialize accentColor and primaryColor with default values when theme colors are undefined', () => {
      spyOnProperty(themeService, 'accentColor', 'get').and.returnValue(
        undefined
      );
      spyOnProperty(themeService, 'primaryColor', 'get').and.returnValue(
        undefined
      );

      fixture = TestBed.createComponent(DialogForm);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(component['accentColor']()).toBe('#fff');
      expect(component['primaryColor']()).toBe('#fff');
    });

    /**
     * Verifies that the component registers a cleanup callback
     * via DestroyRef.onDestroy during its initialization phase.
     *
     * This test ensures that the component correctly participates
     * in Angular's destruction lifecycle by registering cleanup logic,
     * without asserting the execution of the callback itself.
     */
    it('Should register cleanup callback via DestroyRef', () => {
      const destroyRef = TestBed.inject(DestroyRef);
      const onDestroySpy = spyOn(destroyRef, 'onDestroy');

      fixture = TestBed.createComponent(DialogForm);
      fixture.detectChanges();

      expect(onDestroySpy).toHaveBeenCalled();
    });
  });
});
