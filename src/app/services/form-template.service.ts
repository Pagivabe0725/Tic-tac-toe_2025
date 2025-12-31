import { computed, inject, Injectable, Signal } from '@angular/core';
import { FieldKey } from '../utils/types/dialog-form-field-model.type';
import { Auth } from './auth.service';
import { Store } from '@ngrx/store';
import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../store/selectors/game-settings.selector';
import { FormField } from '../utils/interfaces/form-field-template.interface';
import { DialogStructure } from '../utils/interfaces/dialog-structure.interface';
import { HARNESS_VALUES } from '../utils/constants/hardness.constant';

/**
 * @service FormTemplate
 *
 * Provides reactive, strongly-typed form field configurations for different
 * sections of the application (game settings, login, registration, theme settings, etc.).
 *
 * Each form field automatically updates its `baseValue` from the latest state
 * in the store or authentication service, making the form reactive to state changes.
 */
@Injectable({
  providedIn: 'root',
})
export class FormTemplate {
  /** Auth service, injected for user info like available options */
  #auth: Auth = inject(Auth);

  /** NgRx Store service for reactive state selection */
  #store: Store = inject(Store);

  /** Reactive structure for game settings form fields */
  readonly #gameSettingsStructure: Signal<{
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  }> = computed(() => {
    return {
      /** Form fields for game settings */
      structure: [
        {
          key: 'size',
          title: 'Board Size',
          type: 'select',
          model: 'size',
          options: [3, 4, 5, 6, 7, 8, 9],
          // Reactive value from store
          baseValue: this.#store.selectSignal(selectGameSize)(),
          valueType: 'number',
        },
        {
          key: 'opponent',
          title: 'Opponent Type',
          type: 'select',
          model: 'opponent',
          // Only show 'computer' if user is logged in
          options: this.#auth.user() ? ['computer', 'player'] : ['player'],
          baseValue:
            (this.#auth.user() &&
              this.#store.selectSignal(selectGameOpponent)()) ??
            'player',
          valueType: 'string',
        },
        {
          key: 'hardness',
          title: 'Difficulty',
          type: 'range',
          model: 'hardness',
          min: 1,
          max: HARNESS_VALUES.length,
          baseValue: this.#store.selectSignal(selectGameHardness)(),
          valueType: 'number',
        },
      ],

      /** Buttons for the form */
      buttons: [
        { button: 'trigger', name: 'Accept', triggerValue: 'form' },
        { button: 'reject', name: 'Reject' },
      ],

      /** Title for the dialog */
      title: 'Game settings',
    };
  });

  /** Save game form structure */
  readonly #saveStructure: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    structure: [
      {
        key: 'gameName',
        title: 'Game Name',
        type: 'text',
        model: 'gameName',
        errorKeys: ['required'],
        valueType: 'string',
      },
    ],

    buttons: [
      { button: "trigger", name: 'Save', triggerValue:'form' },
      { button: 'reject', name: 'Cancel' },
    ],
    title: 'Save game',
  };

  /** Theme settings form structure */
  readonly #settingStructure: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    structure: [
      {
        key: 'primaryColor',
        title: 'Primary Color',
        type: 'color',
        model: 'primaryColor',
        valueType: 'string',
      },
      {
        key: 'accentColor',
        title: 'Accent Color',
        type: 'color',
        model: 'accentColor',
        valueType: 'string',
      },
    ],

    buttons: [
      { button: 'accept', name: 'Apply', triggerValue: 'form' },
      { button: 'trigger', name: 'Cancel', triggerValue: 'reset' },
    ],
    title: 'Settings',
  };

  /** Login form structure */
  readonly #loginStructure: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    structure: [
      {
        key: 'email',
        title: 'Email Address',
        type: 'email',
        model: 'email',
        errorKeys: ['required', 'invalidEmail', 'emailDoesNotExist'],
        valueType: 'string',
      },
      {
        key: 'password',
        title: 'Password',
        type: 'password',
        model: 'password',
        errorKeys: ['required', 'shortPassword', 'longPassword'],
        valueType: 'string',
      },
    ],

    buttons: [
      { button: 'trigger', name: 'Login', triggerValue: 'form' },
      {
        button: 'trigger',
        name: 'Registration',
        triggerValue: 'change:registration',
      },
      { button: 'reject', name: 'Cancel' },
    ],
    title: 'Login',
  };

  /** Registration form structure */
  readonly #registrationStructure: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    structure: [
      {
        key: 'email',
        title: 'Email Address',
        type: 'email',
        model: 'email',
        errorKeys: ['required', 'invalidEmail', 'emailInUse'],
        valueType: 'string',
      },
      {
        key: 'password',
        title: 'Password',
        type: 'password',
        model: 'password',
        errorKeys: ['required', 'shortPassword', 'longPassword'],
        valueType: 'string',
      },
      {
        key: 'rePassword',
        title: 'Confirm Password',
        type: 'password',
        model: 'rePassword',
        errorKeys: ['required', 'shortPassword', 'longPassword'],
        valueType: 'string',
      },
    ],

    buttons: [
      { button: 'trigger', name: 'Register', triggerValue: 'form' },
      { button: 'trigger', name: 'Login', triggerValue: 'change:login' },
      { button: 'reject', name: 'Cancel' },
    ],
    title: 'Registration',
  };

  /** Email change form structure */
  readonly #emailChange: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    title: 'Change email',
    structure: [
      {
        key: 'email',
        title: 'Old email',
        type: 'email',
        model: 'email',
        errorKeys: ['required', 'invalidEmail', 'notCurrentUserEmail'],
        valueType: 'string',
      },
      {
        key: 'newEmail',
        title: 'New email',
        type: 'email',
        model: 'newEmail',
        errorKeys: ['required', 'invalidEmail', 'emailInUse'],
        valueType: 'string',
      },
    ],
    buttons: [
      { button: 'trigger', name: 'Change', triggerValue: 'form' },
      { button: 'reject', name: 'Back' },
    ],
  };

  /** Password change form structure */
  readonly #passwordChange: {
    structure: FormField[];
    buttons: DialogStructure['buttons'];
    title: string;
  } = {
    title: 'Change password',
    structure: [
      {
        key: 'password',
        title: 'Old password',
        type: 'password',
        model: 'password',
        errorKeys: ['required', 'shortPassword', 'notCurrentUserPassword'],
        valueType: 'string',
      },
      {
        key: 'newPassword',
        title: 'New password',
        type: 'password',
        model: 'newPassword',
        errorKeys: ['required', 'shortPassword'],
        valueType: 'string',
      },
      {
        key: 'rePassword',
        title: 'New password again',
        type: 'password',
        model: 'rePassword',
        errorKeys: ['required', 'shortPassword'],
        valueType: 'string',
      },
    ],
    buttons: [
      { button: 'trigger', name: 'Change', triggerValue: 'form' },
      { button: 'reject', name: 'Back' },
    ],
  };

  /** Map linking form field keys to their structures, buttons and title */
  #formFieldMap = computed(
    () =>
      new Map<
        FieldKey,
        {
          structure: FormField[];
          buttons: DialogStructure['buttons'];
          title: string;
        }
      >([
        ['game_setting', this.#gameSettingsStructure()],
        ['save', this.#saveStructure],
        ['setting', this.#settingStructure],
        ['login', this.#loginStructure],
        ['registration', this.#registrationStructure],
        ['email_change', this.#emailChange],
        ['password_change', this.#passwordChange],
      ])
  );

  /** Returns the current field map */
  get formFieldMap(): Map<
    FieldKey,
    {
      structure: FormField[];
      buttons: DialogStructure['buttons'];
      title: string;
    }
  > {
    return this.#formFieldMap();
  }

  /** Returns buttons for a given field key */
  getButtonsByFieldKey(fieldKey: FieldKey): DialogStructure['buttons'] {
    return this.formFieldMap.get(fieldKey)!.buttons;
  }

  /** Returns structure for a given field key */
  getStructureByFieldKey(fieldKey: FieldKey): FormField[] {
    return this.formFieldMap.get(fieldKey)!.structure;
  }

  /** Returns title for a given field key */
  getTitleByFieldKey(fieldKey: FieldKey): string {
    return this.formFieldMap.get(fieldKey)!.title;
  }
}
