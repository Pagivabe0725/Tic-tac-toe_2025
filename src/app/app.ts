import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
 

  ngOnInit(): void {}
}
