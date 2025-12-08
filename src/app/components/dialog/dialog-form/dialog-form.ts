import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  runInInjectionContext,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';

import { Theme } from '../../../services/theme.service';
import {
  FieldKey,
  FormFieldModel,
} from '../../../utils/types/dialog-form-field-model.type';
import { FormError } from '../../../services/form-error.service';
import { FormTemplate } from '../../../services/form-template.service';
import { Functions } from '../../../services/functions.service';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { DialogContent } from '../../../utils/types/dialog-content.type';
import { ErrorKeys } from '../../../utils/types/error-messages.type';
import { Store } from '@ngrx/store';
import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../../../store/selectors/game-settings.selector';
import { GameSettings } from '../../../utils/interfaces/game-settings.interface';
import { FormField } from '../../../utils/interfaces/form-field-template.interface';

/**
 * Component representing a fully reactive dialog form.
 *
 * This form dynamically adjusts its fields, validation, and appearance
 * based on the active dialog content and user interaction.
 * It integrates Angular signals for fine-grained reactivity without subscriptions.
 */
@Component({
  selector: 'app-dialog-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-form.html',
  styleUrl: './dialog-form.scss',
})
export class DialogForm {
  /** DialogHandler: manages dialog state and triggers */
  protected dialog: DialogHandler = inject(DialogHandler);

  /** Theme service: provides and controls theme colors */
  protected theme: Theme = inject(Theme);

  /** FormError service: handles validation and error messages */
  protected formErrorHandler: FormError = inject(FormError);

  /** FormTemplate service: provides field structure templates */
  #formTemplate: FormTemplate = inject(FormTemplate);

  /** Functions service: helper utility functions */
  protected helperFunctions: Functions = inject(Functions);

  /** DestroyRef: cleans up subscriptions and effects on destroy */
  readonly #destroy: DestroyRef = inject(DestroyRef);

  /** Injector: used for runInInjectionContext */
  #injector = inject(Injector);

  /** NgRx store reference for game settings */
  #store: Store = inject(Store);

  /** Array of field keys for the active dialog form */
  #inputkeys?: string[];

  /** Signal for the current form structure (FormField[]) */
  protected actualStructure: Signal<FormField[]> = computed(() =>
    this.#formTemplate.getStructureByFieldKey(this.dialog.actualContent()!)
  );

  /** Signal reference to the NgForm element */
  protected ngForm: Signal<NgForm | undefined> = viewChild('form', {
    read: NgForm,
  });

  /** WritableSignal for primary theme color */
  protected primaryColor: WritableSignal<string> = signal(
    this.theme.primaryColor ?? '#fff'
  );

  /** Backup of primaryColor for reset purposes */
  private previousPrimaryColor = this.primaryColor();

  /** WritableSignal for accent theme color */
  protected accentColor: WritableSignal<string> = signal(
    this.theme.accentColor ?? '#fff'
  );

  /** Backup of accentColor for reset purposes */
  private previousAccentColor = this.accentColor();

  /** WritableSignal for game name input field */
  protected gameName: WritableSignal<string> = signal('');

  /** WritableSignal for email input field */
  protected email: WritableSignal<string> = signal('');

  /** WritableSignal for new email input field */
  protected newEmail: WritableSignal<string> = signal('');

  /** WritableSignal for password input field */
  protected password: WritableSignal<string> = signal('');

  /** WritableSignal for new password input field */
  protected newPassword: WritableSignal<string> = signal('');

  /** WritableSignal for password confirmation field */
  protected rePassword: WritableSignal<string> = signal('');

  /** WritableSignal for game hardness setting */
  protected hardness: WritableSignal<GameSettings['hardness']> = signal(
    this.#store.selectSignal(selectGameHardness)()
  );

  /** WritableSignal for game opponent setting */
  protected opponent: WritableSignal<GameSettings['opponent']> = signal(
    this.#store.selectSignal(selectGameOpponent)()
  );

  /** WritableSignal for game board size setting */
  protected size: WritableSignal<GameSettings['size']> = signal(
    this.#store.selectSignal(selectGameSize)()
  );

  /** Signal for current active dialog content */
  actualObjectSignal: Signal<DialogContent> = this.dialog.actualContent;

  constructor() {
    /** Effect: updates input keys whenever dialog content changes */
    effect(() => {
      this.#inputkeys = this.#formTemplate.formFieldMap
        .get(this.dialog.actualContent()!)!
        .structure.map((field) => field.key);
    });

    /** Effect: synchronize theme signals with Theme service */
    effect(() => {
      this.theme.accentColor = this.accentColor();
      this.theme.primaryColor = this.primaryColor();
    });

    /** Subscribe to dialog triggers for form actions */
    const triggerSubscription = this.dialog
      .waitForTrigger()
      .subscribe((value: string) => {
        if (value === 'form') {
          this.sendResults();
        } else if (value === 'reset') {
          this.resetProperties();
        } else if (value.includes('change')) {
          const newDialogContent = value.split(':')[1] as DialogContent;
          this.dialog.actualContent = newDialogContent;
          Object.values(this.ngForm()!.controls).forEach((control) =>
            this.formErrorHandler.clearErrors(control)
          );
        }
      });

    /** Cleanup subscription on destroy */
    this.#destroy.onDestroy(() => {
      triggerSubscription.unsubscribe();
    });
  }

  /** Returns the signal for a given form field model */
  protected getFieldByModel(fieldName: FormFieldModel) {
    return (this as any)[fieldName];
  }

  /** Collects current form values into an object */
  private getFormResult() {
    const result: any = {};
    const reference = this as any;

    if (this.#inputkeys) {
      for (const key of this.#inputkeys!) {
        result[key] = (reference as any)[key]();
      }
    }
    return result;
  }

  /** Validates all controls and marks errors */
  async checkcontrols(): Promise<void> {
    for (const key of this.#inputkeys!) {
      const control = this.ngForm()?.form.get(key);
      let errors: ErrorKeys[] = [];
      if (control) {
        errors = this.#formTemplate.formFieldMap
          .get(this.actualObjectSignal()!)!
          .structure.flatMap((field) => {
            if (field.key === key && field.errorKeys?.length) {
              return field.errorKeys;
            } else {
              return [];
            }
          });
        await this.formErrorHandler.checkErrors(control, ...errors);
      }
    }

    /** Additional registration specific validation */
    if (this.dialog.actualContent() === 'registration') {
      const password = this.ngForm()!.form.get('password');
      const confirmPassword = this.ngForm()!.form.get('rePassword');
      this.formErrorHandler.markAsPasswordMismatch(password!, confirmPassword!);
    }
    /** Additional password changing specific validation */
    if (this.dialog.actualContent() === 'password_change') {
      const newPassword = this.ngForm()!.form.get('newPassword');
      const confirmPassword = this.ngForm()!.form.get('rePassword');
      this.formErrorHandler.markAsPasswordMismatch(
        newPassword!,
        confirmPassword!
      );
    }
  }

  /** Sends form values if valid */
  async sendResults(): Promise<void> {
    await this.checkcontrols();
    if (this.ngForm()!.form.valid) {
      const result = this.getFormResult();
      this.dialog.emitData(result);
    }
  }

  /** Resets all signals to previous values */
  async resetProperties() {
    console.log(this.#inputkeys);
    for (const key of this.#inputkeys!) {
      const reference = this as any;
      (reference[key] as WritableSignal<unknown>).set(
        reference['previous' + key[0].toUpperCase() + key.substring(1)]
      );
    }

    /** Wait until next render before closing dialog */
    await new Promise<void>((resolve) =>
      runInInjectionContext(this.#injector, () => {
        afterNextRender(resolve);
      })
    );

    /** Emit close event to dialog */
    this.dialog.emitData('CLOSE_EVENT');
  }
}
