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
import { DialogHandler } from '../../../services/dialog-handler.service';
import { Theme } from '../../../services/theme.service';
import { FORM_FIELDS_MAP } from '../../../utils/constants/dialog-form-pattern.constant';
import { FieldKey, FormFieldModel } from '../../../utils/types/dialog-form-field-model.type';




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

  protected get hardness() {
    return this.#hardness();
  }
  protected set hardness(value: number) {
    this.#hardness.set(value);
  }

  protected get primaryColor() {
    return this.#primaryColor();
  }
  protected set primaryColor(value: string) {
    this.#primaryColor.set(value);
  }

  protected get accentColor() {
    return this.#accentColor();
  }
  protected set accentColor(value: string) {
    this.#accentColor.set(value);
  }

  protected get gameName() {
    return this.#gameName();
  }
  protected set gameName(value: string) {
    this.#gameName.set(value);
  }

  protected get email() {
    return this.#email();
  }
  protected set email(value: string) {
    this.#email.set(value);
  }

  protected get password() {
    return this.#password();
  }
  protected set password(value: string) {
    this.#password.set(value);
  }

  protected get rePassword() {
    return this.#rePassword();
  }
  protected set rePassword(value: string) {
    this.#rePassword.set(value);
  }

  protected get opponent() {
    return this.#opponent();
  }
  protected set opponent(value: string) {
    this.#opponent.set(value);
  }

  protected get size() {
    return this.#size();
  }
  protected set size(value: number) {
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

  protected getterSetter(fieldName: FormFieldModel) {
    return {
      get: () => (this as any)[fieldName],
      set: (value: any) => ((this as any)[fieldName] = value),
    };
  }
}
