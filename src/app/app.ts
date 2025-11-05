import { Component, inject, OnInit, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FormsModule } from '@angular/forms';
import { Dialog } from './components/dialog/dialog';
import { DialogHandler } from './services/dialog-handler.service';
import { DialogForm } from './components/dialog/dialog-form/dialog-form';
import { Auth } from './services/auth.service';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    FormsModule,
    Dialog,
    DialogForm,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected dialog: DialogHandler = inject(DialogHandler);
  private auth:Auth = inject(Auth)
  
  async ngOnInit():Promise<void>{

  /*   const csrf = await this.auth.getCSRF()
    console.log(csrf) */
    
  }
}
