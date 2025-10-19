import { Component, computed, contentChild, effect, inject, Signal } from '@angular/core';
import { dialogContent, DialogHandler } from '../../services/dialog-handler';
import { NgForm } from '@angular/forms';

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

  private form :Signal<NgForm | undefined> = contentChild('form', { read: NgForm });

  /**
   * placeholder
   */
  protected title = computed(() => {
    switch (this.#dialog.activeContent() as dialogContent) {
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
      }
    })
  }

  /**
   * placeholder
   */
  protected closeDialog() {
    this.#dialog.close();
  }

  protected emitData(value: any) {
    this.#dialog.dailogEmitter(value);
  }
}
