import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Paginator', () => {
  /**
   * The Paginator component instance under test.
   * Provides access to its methods and properties for unit testing.
   */
  let component: Paginator;

  /**
   * Angular test fixture for the Paginator component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<Paginator>;

  /**
   * The currently active page number used as input for the Paginator component.
   * Represents the page being displayed during tests.
   */
  let actualPage: number;

  /**
   * The total number of available pages used as input for the Paginator component.
   * Represents the upper limit for pagination during tests.
   */
  let pageCount: number;

  /**
   * Initializes the testing module, creates the component instance,
   * and provides required InputSignals (`page` and `pageCount`).
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginator],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Paginator);
    component = fixture.componentInstance;

    actualPage = 1;
    pageCount = 3;

    // Override required input signals with test values
    (component as any)['page'] = signal(
      actualPage
    ) as unknown as InputSignal<number>;

    (component as any)['pageCount'] = signal(
      pageCount
    ) as unknown as InputSignal<number>;

    fixture.detectChanges(); // Trigger initial rendering
  });

  /**
   * HTML rendering tests
   */
  describe('HTML', () => {
    /**
     * When the current page is the first page,
     * only the forward (next) arrow buttons should be displayed.
     */
    it('Should display only the next arrow buttons for pagination', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);
      expect((buttons[0].nativeElement as HTMLButtonElement).name).toBe(
        'arrow_3'
      );
      expect((buttons[1].nativeElement as HTMLButtonElement).name).toBe(
        'arrow_4'
      );
    });

    /**
     * When the current page is in the middle,
     * all pagination arrow buttons should be displayed.
     */
    it('Should display all arrow buttons for pagination', async () => {
      // Update page signal to a middle page
      (component as any)['page'].set(2);

      await fixture.whenStable();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(4);

      // Verify that all arrows are rendered in correct order
      for (let i = 0; i < buttons.length; i++) {
        expect((buttons[i].nativeElement as HTMLButtonElement).name).toBe(
          `arrow_${i + 1}`
        );
      }
    });

    /**
     * When the current page is the last page,
     * only the backward (previous) arrow buttons should be displayed.
     */
    it('Should display only the back arrow buttons for pagination', async () => {
      (component as any)['page'].set(3);

      fixture.detectChanges();
      await fixture.whenStable();

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);
      expect((buttons[0].nativeElement as HTMLButtonElement).name).toBe(
        'arrow_1'
      );
      expect((buttons[1].nativeElement as HTMLButtonElement).name).toBe(
        'arrow_2'
      );
    });
  });

  /**
   * Component method tests
   */
  describe('Component methods:', () => {
    /**
     * Tests for the setPage() method
     */
    describe('[setPage] function:', () => {
      /**
       * Ensures that setPage calls the private changePage method
       * when the incoming page value is within valid bounds.
       */
      it('Should call `changePage` function when the incoming value is valid', () => {
        // Spy on private method
        spyOn<any>(component, 'changePage');

        component['setPage'](pageCount - 1);

        expect(component['changePage']).toHaveBeenCalledOnceWith(pageCount - 1);
      });

      /**
       * Ensures that setPage does NOT call changePage
       * when the incoming page value is out of range.
       */
      it('Should not call `changePage` function when the incoming value is invalid', () => {
        spyOn<any>(component, 'changePage');

        // Pass an invalid page number (greater than pageCount)
        component['setPage'](component['pageCount']() + 1);

        expect(component['changePage']).not.toHaveBeenCalled();
      });
    });

    /**
     * Tests for the changePage() method
     */
    describe('[changePage] function:', () => {
      /**
       * Ensures that changePage emits the correct routing parameters
       * via the changeParamsEvent OutputEmitterRef.
       */
      it('Should emit `changeParamsEvent`', () => {
        const emitSpy = spyOn(component['changeParamsEvent'], 'emit');

        component['changePage'](pageCount - 1);

        expect(emitSpy).toHaveBeenCalledOnceWith({
          path: ['account'],
          queryParams: { page: pageCount - 1 },
          queryParamsHandling: 'merge',
        });
      });
    });
  });
});
