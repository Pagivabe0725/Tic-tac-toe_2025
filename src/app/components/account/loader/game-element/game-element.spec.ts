import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameElement } from './game-element';

describe('GameElement', () => {
  let component: GameElement;
  let fixture: ComponentFixture<GameElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameElement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
