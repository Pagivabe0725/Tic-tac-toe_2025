import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogHandler } from '../../../services/dialog-handler';
import { Theme } from '../../../services/theme';

@Component({
  selector: 'app-dialog-form',
  imports: [FormsModule],
  templateUrl: './dialog-form.html',
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: block; /* ha szeretnéd, hogy a host blokk szintű legyen */
      }
    `,
  ],
})
export class DialogForm {
  protected dialog: DialogHandler = inject(DialogHandler);
  protected theme: Theme = inject(Theme)


  protected chosableSizes = [3, 4, 5, 6, 7, 8, 9];
  protected basicSize = 3;
  protected basicOpponent = 'computer';
  protected hardness = 1
  protected primaryColor = this.theme.primaryColor
  protected accentColor = this.theme.accentColor

  protected email = ''
  protected password = ''
  protected rePassword = ''
}
