import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../services/theme';

@Component({
  selector: 'header[appHeader]',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  #theme: Theme = inject(Theme);

  get mode(): 'dark' | 'light' {
    return this.#theme.mode!;
  }

  set mode(newMode: 'dark' | 'light') {
    this.#theme.mode = newMode;
  }
}
