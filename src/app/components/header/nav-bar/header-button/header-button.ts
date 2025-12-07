import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'button[appHeaderButton]',
  imports: [],
  templateUrl: './header-button.html',
  styles: `
    :host{
      padding: 5px;
      display: flex;
      cursor: pointer;
      border: 2px outset var(--p-30);
      border-radius: 1000px;
      background-image: linear-gradient(
        var(--gradient-p-component),
        var(--gradient-a-component)
      );
      user-select: none;
      transition: all ease-in-out 0.4s;

      svg {
        width: max(24px, 2vw);
        height: max(24px, 2vw);
        fill: var(--p-110);
      }

      &:hover {
        scale: 1.1;
      }
      &:active {
        scale: 0.8;
      }
    }
  `,
})
export class HeaderButton {
  /** InputSignal: path to the icon displayed inside the button */
  iconPath: InputSignal<string> = input.required();
}
