import { Component, inject, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FormsModule } from '@angular/forms';
import { Dialog } from './components/dialog/dialog';
import { DialogHandler } from './services/dialog-handler';
import { DialogForm } from './components/dialog/dialog-form/dialog-form';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    FormsModule,
    Dialog,
    DialogForm
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected dialog: DialogHandler = inject(DialogHandler);
}
