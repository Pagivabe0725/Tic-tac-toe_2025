import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { DialogHandler } from '../../services/dialog-handler.service';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { Form } from '../../services/form.service';
import { DialogContent } from '../../utils/types/dialog-content.type';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  /**
   * placeholder
   */
  #dialog: DialogHandler = inject(DialogHandler);


  /**
   * placeholder
   */

  #formHandler : Form = inject(Form)

  /**
   * placeholder
   */
  public form: InputSignal<NgForm | undefined> = input.required();

  /**
   * placeholder
   */

  protected dialogContent: Signal<DialogContent> = this.#dialog.activeContent;

  /**
   * placeholder
   */
  protected title = computed(() => {
    switch (this.#dialog.activeContent() as DialogContent) {
      case 'game_setting':
        return 'Game Settings';
      case 'save':
        return 'Save';
      case 'setting':
        return 'Settings';
      case 'login':
        return 'Login';
      case 'registration':
        return 'Registration';
      case 'info':
        return 'Information';
      default:
        return 'Title';
    }
  });

  constructor() {
    console.log(1);
    effect(() => {
      if (this.form()) {
        console.log(this.form());
        //this.getControls(this.form()!.form.controls)
      }
    });
  }

  /**
   * placeholder
   */
  protected closeDialog() {
    this.#dialog.close();
  }

  getControls(controls: { [key: string]: AbstractControl } | FormGroup) {
    let keys: string[] = [];

    if (controls instanceof FormGroup) {
      keys = Object.keys(controls.getRawValue());
    } else if (controls && typeof controls === 'object') {
      keys = Object.keys(controls);
      if (!keys.length) {
        keys = Object.getOwnPropertyNames(controls);
      }
    }

    console.log(keys);
  }

  /**
   * placeholder
   * @param value
   */
  protected emitData(value: any) {
    this.#dialog.dailogEmitter(value);
  }

  /**
   * placeholder
   */

  protected toggleAuthMode(): void {
    this.#dialog.activeContent =
      this.dialogContent() === 'login' ? 'registration' : 'login';
  }

  

}
