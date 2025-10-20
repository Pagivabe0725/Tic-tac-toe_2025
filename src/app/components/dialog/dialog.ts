import { Component, computed, contentChild, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { DialogContent, DialogHandler } from '../../services/dialog-handler';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog  {
  /**
   * placeholder
   */
  #dialog: DialogHandler = inject(DialogHandler);

  public form : InputSignal<NgForm | undefined> = input.required()

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


  constructor(){
    console.log(1)
    effect(()=>{

       if(this.form()){
      console.log(this.form())
       //this.getControls(this.form()!.form.controls)
       }
      
    })
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
}
