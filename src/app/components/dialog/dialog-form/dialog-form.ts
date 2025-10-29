import {
  Component,
  effect,
  inject,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogContent, DialogHandler } from '../../../services/dialog-handler';
import { Theme } from '../../../services/theme';

export type FormFieldModel =
  | 'hardness'
  | 'primaryColor'
  | 'accentColor'
  | 'gameName'
  | 'email'
  | 'password'
  | 'rePassword'
  | 'opponent'
  | 'size';

export type FormFieldValidator = {
  errorMessage: string;
  logic: (value: any) => boolean;
};

export type FormField = {
  field: string;
  title: string;
  type: 'select' | 'text' | 'email' | 'range' | 'color' | 'password';
  model: FormFieldModel;
  options?: string[] | number[];
  min?: number;
  max?: number;
  validator?: FormFieldValidator; // <- új mező
};

export type FieldKey = Exclude<DialogContent, undefined>;

export const FORM_FIELDS_MAP: Map<FieldKey, FormField[]> = new Map([
  [
    'game_setting',
    [
      {
        field: 'size',
        title: 'Board Size',
        type: 'select',
        model: 'size',
        options: [3, 4, 5, 6, 7, 8, 9],
      },
      {
        field: 'opponent',
        title: 'Opponent Type',
        type: 'select',
        model: 'opponent',
        options: ['computer', 'player'],
      },
      {
        field: 'hardness',
        title: 'Difficulty',
        type: 'range',
        model: 'hardness',
        min: 1,
        max: 4,
      },
    ],
  ],
  [
    'save',
    [
      {
        field: 'gameName',
        title: 'Game Name',
        type: 'text',
        model: 'gameName',
      },
    ],
  ],
  [
    'setting',
    [
      {
        field: 'primary',
        title: 'Primary Color',
        type: 'color',
        model: 'primaryColor',
      },
      {
        field: 'accent',
        title: 'Accent Color',
        type: 'color',
        model: 'accentColor',
      },
    ],
  ],
  [
    'login',
    [
      {
        field: 'email',
        title: 'Email Address',
        type: 'text',
        model: 'email',
      },
      {
        field: 'Password',
        title: 'Password',
        type: 'password',
        model: 'password',
      },
    ],
  ],
  [
    'registration',
    [
      {
        field: 'email',
        title: 'Email Address',
        type: 'text',
        model: 'email',
      },
      {
        field: 'Password',
        title: 'Password',
        type: 'password',
        model: 'password',
      },
      {
        field: 'rePassword',
        title: 'Confirm Password',
        type: 'password',
        model: 'rePassword',
      },
    ],
  ],
]);

@Component({
  selector: 'app-dialog-form',
  imports: [FormsModule],
  templateUrl: './dialog-form.html',
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: block;
      }

      .own-error-span {
        width: 85%;
        font-weight: 100;
        color: red;
        transition: all ease-in 0.3s;
      }

      .own-error-fieldset {
        border: 2px outset red;
        legend {
          color: red;
          font-style: italic;
        }
        input {
          color: red;
          border: 2px solid red;
          font-style: italic;
        }
      }
    `,
  ],
})
export class DialogForm {
  protected dialog: DialogHandler = inject(DialogHandler);
  protected theme: Theme = inject(Theme);

  protected templates = FORM_FIELDS_MAP;

  #hardness: WritableSignal<number> = signal(1);
  #primaryColor: WritableSignal<string> = signal(
    this.theme.primaryColor ?? '#fff'
  );
  #accentColor: WritableSignal<string> = signal(
    this.theme.accentColor ?? '#fff'
  );
  #gameName: WritableSignal<string> = signal('');
  #email: WritableSignal<string> = signal('');
  #password: WritableSignal<string> = signal('');
  #rePassword: WritableSignal<string> = signal('');
  #opponent: WritableSignal<string> = signal('computer');
  #size: WritableSignal<number> = signal(3);
  get hardness() {
    return this.#hardness();
  }
  set hardness(value: number) {
    this.#hardness.set(value);
  }

  get primaryColor() {
    return this.#primaryColor();
  }
  set primaryColor(value: string) {
    this.#primaryColor.set(value);
  }

  get accentColor() {
    return this.#accentColor();
  }
  set accentColor(value: string) {
    this.#accentColor.set(value);
  }

  get gameName() {
    return this.#gameName();
  }
  set gameName(value: string) {
    this.#gameName.set(value);
  }

  get email() {
    return this.#email();
  }
  set email(value: string) {
    this.#email.set(value);
  }

  get password() {
    return this.#password();
  }
  set password(value: string) {
    this.#password.set(value);
  }

  get rePassword() {
    return this.#rePassword();
  }
  set rePassword(value: string) {
    this.#rePassword.set(value);
  }

  get opponent() {
    return this.#opponent();
  }
  set opponent(value: string) {
    this.#opponent.set(value);
  }

  get size() {
    return this.#size();
  }
  set size(value: number) {
    this.#size.set(value);
  }
  protected form: Signal<NgForm | undefined> = viewChild('form', {
    read: NgForm,
  });

  public formEmitter: OutputEmitterRef<NgForm | undefined> = output();

  constructor() {
    effect(() => {
      this.formEmitter.emit(this.form());
    });
  }

  protected getActualObject(): FieldKey | undefined {
    const actualContent = this.dialog.activeContent();
    return actualContent ? (actualContent as FieldKey) : undefined;
  }

  getterSetter(fieldName: FormFieldModel) {
    return {
      get: () => (this as any)[fieldName],
      set: (value: any) => ((this as any)[fieldName] = value),
    };
  }
}
