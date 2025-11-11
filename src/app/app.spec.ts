import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { DialogHandler } from './services/dialog-handler.service';
import { HttpClientModule } from '@angular/common/http';
import { DIALOG_CONTENT } from './utils/constants/dialog-content.constant';

describe('App', () => {
  let fixture: any;
  let compiled: HTMLElement;
  let dialogHandler: DialogHandler;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DialogHandler, useFactory: () => new DialogHandler() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  describe('Dependency injection', () => {
    it('Should inject DialogHandler into the component', () => {
      const app = fixture.componentInstance;
      expect(app['dialog']).toBeTruthy();
    });
  });

  describe('Structural elements', () => {
    it('Should create the app', () => {
      expect(fixture.componentInstance).toBeTruthy(
        'The app failed to initialize.'
      );
    });

    it('Should render the main structure', () => {
      expect(compiled.querySelector('div')).not.toBeNull(
        'The div that represents the entire game did not render.'
      );
      expect(compiled.querySelector('header')).not.toBeNull(
        'The header of the application did not render.'
      );
      expect(compiled.querySelector('main')).not.toBeNull(
        'The main HTML element did not render.'
      );
    });
  });

  describe('Dialog rendering', () => {
    beforeEach(() => {
      dialogHandler = TestBed.inject(DialogHandler);
      dialogHandler.activeContent = undefined;
    });

    it('Should render the dialog for multiple active contents', () => {
      for (const content of DIALOG_CONTENT) {
          if (content===undefined) continue
        dialogHandler.activeContent = content;
        fixture.detectChanges();

        const dialog = fixture.nativeElement.querySelector('app-dialog');
        expect(dialog).not.toBeNull(
          `Dialog should be rendered for activeContent = ${content}`
        );
      }
    });

    it('Should not render the dialog when closed', () => {
      dialogHandler.activeContent = undefined;
      fixture.detectChanges();

      const dialog = compiled.querySelector('app-dialog');
      expect(dialog).toBeNull();
    });

    it('Should open and close the dialog for all active contents', () => {
      for (const content of DIALOG_CONTENT) {
        if (content===undefined) continue
        dialogHandler.activeContent = content;
        fixture.detectChanges();
        let dialog = fixture.nativeElement.querySelector('app-dialog');
        expect(dialog).not.toBeNull(
          `Dialog should be rendered when activeContent = ${content}`
        );

        dialogHandler.activeContent = undefined;
        fixture.detectChanges();
        dialog = fixture.nativeElement.querySelector('app-dialog');
        expect(dialog).toBeNull(
          `Dialog should be removed after closing for activeContent = ${content}`
        );
      }
    });
  });
});
