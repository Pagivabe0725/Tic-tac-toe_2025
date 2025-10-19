import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDisplayPart } from './game-display-part';

xdescribe('GameDisplayPart', () => {
  let component: GameDisplayPart;
  let fixture: ComponentFixture<GameDisplayPart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDisplayPart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameDisplayPart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
