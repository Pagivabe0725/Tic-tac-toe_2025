import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFound } from './not-found';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

/**
 * @fileoverview
 * Unit tests for the NotFound component.
 * 
 * - Verifies that the component renders correctly.
 * - Ensures that clicking the navigation button redirects the user to the main page ('/tic-tac-toe').
 * - Uses zoneless change detection for isolated component testing.
 */

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Ensures that clicking the button navigates the user to the main page ('/tic-tac-toe').
   */
  it('Should navigate to "/tic-tac-toe" when the button is clicked', () => {
    // Inject the Router service
    const router: Router = TestBed.inject(Router);

    // Spy on the navigateByUrl method
    spyOn(router, 'navigateByUrl');

    // Find the button in the template and trigger a click event
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click');

    // Trigger change detection
    fixture.detectChanges();

    // Verify that navigation to the main page was called
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/tic-tac-toe');
  });
});
