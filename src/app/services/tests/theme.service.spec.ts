import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BrakePoint, Theme } from '../theme.service';

/**
 * Unit tests for the Theme service.
 *
 * Tests cover:
 * - Getter and setter behavior (primaryColor, accentColor, mode, width, height)
 * - Utility methods (getBreakPointName, getLigthnesFromOKLCH)
 * - Behavior of setBasicState with mocked CSS and localStorage values
 */
describe('Theme service', () => {
  let service: Theme;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        // Ensure each test gets a fresh instance of Theme
        { provide: Theme, useFactory: () => new Theme() },
      ],
    });
    service = TestBed.inject(Theme);
  });

  /**
   * Test basic getter and setter functionality
   */
  describe('Getters and setters', () => {
    let mockWindowHeight: number;

    beforeEach(() => {
      // Randomized window height for testing dynamic height behavior
      mockWindowHeight = Math.floor(Math.random() * (1000 - 400 + 1)) + 400;
    });

    it('should correctly set and get primaryColor', () => {
      service.primaryColor = 'oklch(0.5 0.1 120)';
      expect(service.primaryColor).toBe('oklch(0.5 0.1 120)');
    });

    it('should correctly set and get accentColor', () => {
      service.accentColor = 'oklch(0.6 0.12 260)';
      expect(service.accentColor).toBe('oklch(0.6 0.12 260)');
    });

    it('should correctly set and get mode', () => {
      service.mode = 'dark';
      expect(service.mode).toBe('dark');
      service.mode = 'light';
      expect(service.mode).toBe('light');
    });

    it('should correctly set and get width', () => {
      service.width = 'lg';
      expect(service.width).toBe('lg');
    });

    it('should correctly set and get height', () => {
      service.height = 1080;
      expect(service.height).toBe(1080);
    });

    it('should set height equal to mocked window.innerHeight', () => {
      Object.defineProperty(window, 'innerHeight', {
        value: mockWindowHeight,
        configurable: true,
      });
      service.height = window.innerHeight;
      expect(service.height).toBe(mockWindowHeight);
    });
  });

  /**
   * Test utility methods
   */
  describe('Utility methods', () => {
    it('getBreakPointName should return correct breakpoint for given window widths', () => {
      const testCases: [number, BrakePoint][] = [
        [0, 'xs'], [639, 'xs'],
        [640, 'sm'], [767, 'sm'],
        [768, 'md'], [1023, 'md'],
        [1024, 'lg'], [1279, 'lg'],
        [1280, 'xl'], [1535, 'xl'],
        [1536, '2xl'], [2000, '2xl'],
      ];

      const getBreakPointName = (service as any).getBreakPointName.bind(service);

      testCases.forEach(([size, expected]) => {
        expect(getBreakPointName(size)).toBe(expected, `Failed for width: ${size}px`);
      });
    });

    it('getLigthnesFromOKLCH should extract correct lightness from OKLCH string', () => {
      const testCases: [string, number][] = [
        ['oklch(0.75 0.1 120)', 0.75],
        ['oklch(0 0.2 180)', 0],
        ['oklch(1 0.5 250)', 1],
        ['oklch(0.5 0 0)', 0.5],
      ];

      testCases.forEach(([oklchString, expected]) => {
        expect(service['getLigthnesFromOKLCH'](oklchString)).toBeCloseTo(expected, 5, `Failed for ${oklchString}`);
      });
    });
  });

  /**
   * Test setBasicState behavior
   */
  describe('setBasicState method', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let getComputedStyleSpy: jasmine.Spy;
    let localStorageGetItemSpy: jasmine.Spy;

    beforeEach(() => {
      // Mock getComputedStyle for CSS variables
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getComputedStyleSpy = spyOn(window, 'getComputedStyle').and.callFake((elem: any) => ({
        getPropertyValue: (prop: string) => {
          switch (prop) {
            case '--theme-primary': return 'oklch(0.5 0.1 120)';
            case '--theme-accent': return 'oklch(0.6 0.1 240)';
            case 'background-color': return 'oklch(0.7 0.1 120)'; // used for default dark/light
            default: return '';
          }
        },
      }) as any);

      // Default localStorage returns null
      localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    });

    it('should initialize colors and mode from CSS if localStorage is empty', () => {
      (service as any).setBasicState();

      expect(service.primaryColor).toBe('oklch(0.5 0.1 120)');
      expect(service.accentColor).toBe('oklch(0.6 0.1 240)');
      expect(service.mode).toBe('dark');
    });

    it('should override CSS values with values from localStorage', () => {
      localStorageGetItemSpy.and.callFake((key: string) => {
        switch (key) {
          case '--theme-primary': return 'oklch(0.2 0.3 100)';
          case '--theme-accent': return 'oklch(0.3 0.2 200)';
          case 'color-scheme': return 'light';
          default: return null;
        }
      });

      (service as any).setBasicState();

      expect(service.primaryColor).toBe('oklch(0.2 0.3 100)');
      expect(service.accentColor).toBe('oklch(0.3 0.2 200)');
      expect(service.mode).toBe('light');
    });
  });
});
