import {
  Component,
  computed,
  DOCUMENT,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  input,
  InputSignal,
  OnInit,
  Output,
  Renderer2,
  Signal,
  ViewEncapsulation,
} from '@angular/core';
import { Theme } from '../../../services/theme';

const sizeMap: Map<number, {icon:string, cover:string}> = new Map([
  [3, {icon:'10vw', cover:'8vw'}],
  [4, {icon:'8vw', cover:'6vw'}],
  [5, {icon:'6.5vw', cover:'4.5vw'}],
  [6, {icon:'4.5vw', cover:'2.5vw'}],
  [7, {icon:'3.5vw', cover:'2.5vw'}],
  [8, {icon:'2.5 vw', cover:'1.5vw'}],
  [9, {icon:'2vw', cover:'1.5vw'}],
]);

@Component({
  selector: 'div[appGameFieldCell]',
  imports: [],
  templateUrl: './game-field-cell.html',
  styleUrl: './game-field-cell.scss',
  host: {
    class: 'own-animated-border own-field',
  },
  encapsulation: ViewEncapsulation.None,
})
export class GameFieldCell  {
  #render2 = inject(Renderer2);
  markup: InputSignal<string | undefined> = input.required();

  @Input({ required: true }) yCoordinate!: number;
  @Input({ required: true }) xCoordinate!: number;
  size:InputSignal<number> = input.required();
  @Output() setPosition: EventEmitter<{
    yCoordinate: number;
    xCoordinate: number;
  }> = new EventEmitter();

  protected fontSize:Signal<{icon:string, cover:string}> = computed(()=>{
    return sizeMap.get(this.size()) ?? {icon:'1vw', cover:'0.8vw'}
  })

  @HostBinding('style.cursor')
  get cursor() {
    return this.markup() ? 'default' : 'pointer';
  }
  @HostBinding('class')
  get scale() {
    return this.markup() ? '' : 'own-cell-hover';
  }
  @HostListener('click')
  fill(): void {
    if (!this.markup()) {
      this.setPosition.emit({
        xCoordinate: this.xCoordinate,
        yCoordinate: this.yCoordinate,
      });
    }
  }




 
  


}
