import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFieldCell } from './game-field-cell';

describe('GameFieldCell', () => {
  let component: GameFieldCell;
  let fixture: ComponentFixture<GameFieldCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFieldCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameFieldCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
