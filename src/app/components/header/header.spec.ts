import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import {
  provideZonelessChangeDetection,
} from '@angular/core';
import { Theme } from '../../services/theme.service';
import {
  DIALOG_CONTENT,
  DialogHandler,
} from '../../services/dialog-handler.service';
import { HttpClientModule } from '@angular/common/http';

/**
 * @fileoverview
 * Unit test suite for the {@link Header} component.
 *
 * This setup ensures that:
 * - The Header component is instantiated correctly.
 * - Injected services ({@link Theme} and {@link DialogHandler}) behave as expected.
 * - Zoneless change detection works with Angular Signals.
 */
describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let theme: Theme;
  let dialog: DialogHandler;

  let mode: 'light' | 'dark';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let modeGetterSpy: jasmine.Spy;
  let modeSetterSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header, HttpClientModule],
      providers: [provideZonelessChangeDetection(), Theme, DialogHandler],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();

    theme = TestBed.inject(Theme);
    dialog = TestBed.inject(DialogHandler);
  });

  /**
   * Tests related to Theme service integration.
   */
  describe('Theme mode management', () => {
    beforeEach(() => {
      // Backing store for mode value
      mode = 'light';

      // Spy the Theme service getter and setter
      modeGetterSpy = spyOnProperty(theme, 'mode', 'get').and.callFake(
        () => mode
      );
      modeSetterSpy = spyOnProperty(theme, 'mode', 'set').and.callFake(
        (value: 'light' | 'dark' | undefined) => {
          if (value !== undefined) {
            mode = value;
          }
        }
      );
    });

    it('should reflect the current mode from Theme and update correctly', () => {
      // Initial value
      expect(component.mode).toBe(
        'light',
        'Expected initial mode to be "light" from Theme service'
      );

      // Update mode
      component.mode = 'dark';

      // Ensure setter spy was called
      expect(modeSetterSpy).toHaveBeenCalledWith('dark');

      // Verify updated value
      expect(component.mode).toBe(
        'dark',
        'Expected mode to be updated to "dark" after setter call'
      );
    });
  });

  /**
   * Tests related to DialogHandler service integration.
   */
  describe('DialogHandler integration', () => {
    beforeEach(() => {
      // Commented out spy workarounds; using real methods
      /* 
      activeContentGetterSpy = spyOnProperty(dialog, 'activeContent', 'get').and.callFake(() => content);
      activeContentSetterSpy = spyOnProperty(dialog, 'activeContent', 'set').and.callFake(
        (value: any) => content.set(value as dialogContent)
      );
      */
    });

    it('should get and set activeContent correctly via DialogHandler', async () => {
      for (const content1 of DIALOG_CONTENT) {
        // Open dialog with specific content
        component['openDialogByContent'](content1);

        // Expect the activeContent to match
        expect(dialog.activeContent()).toBe(content1);

        // Close dialog
        await dialog.close();

        // Expect activeContent reset
        expect(dialog.activeContent()).toBe(undefined);
      }
    });
  });
});
