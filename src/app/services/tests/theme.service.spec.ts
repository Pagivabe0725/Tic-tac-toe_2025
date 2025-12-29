import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, DOCUMENT } from '@angular/core';

import { Theme } from '../theme.service';

/**
 * @fileoverview
 * Unit tests for the `Theme` service.
 *
 * Covers:
 * - Initialization:
 *   - reads width/height from document.defaultView
 *   - registers resize listener
 *   - loads primary/accent/mode from localStorage (fallback to computed styles)
 *   - infers mode from background lightness when scheme not saved
 * - Getters:
 *   - modeSignal reflects mode changes
 * - Effects:
 *   - syncs primary/accent/mode into CSS variables and localStorage
 * - Resize handler:
 *   - updates width/height signals
 */

describe('Theme', () => {
  /** Flush Angular signal effects (zoneless-friendly). */
  const flushEffects = async () => {
    const anyTB = TestBed as any;

    if (typeof anyTB.flushEffects === 'function') {
      anyTB.flushEffects();
      return;
    }

    // Fallback: give the scheduler a chance.
    await new Promise((r) => setTimeout(r, 0));
  };

  /**
   * Test helper to create the service with controlled DOM + storage + computed styles.
   */
  const setup = (config?: {
    computedPrimary?: string;
    computedAccent?: string;
    computedBackground?: string;
    savedPrimary?: string | null;
    savedAccent?: string | null;
    savedScheme?: 'light' | 'dark' | null;
    innerWidth?: number;
    innerHeight?: number;
  }) => {
    const fakeBody = document.createElement('body');

    const fakeWindow = {
      innerWidth: config?.innerWidth ?? 1000,
      innerHeight: config?.innerHeight ?? 700,
      addEventListener: jasmine.createSpy('addEventListener'),
    } as any;

    const fakeDocument = {
      body: fakeBody,
      defaultView: fakeWindow,
    } as unknown as Document;

    const computedPrimary = config?.computedPrimary ?? '#111111';
    const computedAccent = config?.computedAccent ?? '#222222';
    const computedBackground = config?.computedBackground ?? 'oklch(0.9 0 0)';

    // Mock computed styles used in setBasicState().
    spyOn(window, 'getComputedStyle').and.returnValue({
      getPropertyValue: (prop: string) => {
        if (prop === '--theme-primary') return computedPrimary;
        if (prop === '--theme-accent') return computedAccent;
        if (prop === 'background-color') return computedBackground;
        return '';
      },
    } as any);

    // Mock localStorage.
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === '--theme-primary') return config?.savedPrimary ?? null;
      if (key === '--theme-accent') return config?.savedAccent ?? null;
      if (key === 'color-scheme') return (config?.savedScheme ?? null) as any;
      return null;
    });
    const setItemSpy = spyOn(localStorage, 'setItem');

    // Silence logs.
    spyOn(console, 'log');

    // Spy on CSS variable syncing.
    const setPropertySpy = spyOn(fakeBody.style, 'setProperty').and.stub();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        Theme,
        { provide: DOCUMENT, useValue: fakeDocument },
      ],
    });

    const service = TestBed.inject(Theme);

    return { service, fakeWindow, setItemSpy, setPropertySpy };
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Initialization:', () => {
    /**
     * Ensures that width/height are set from defaultView and resize listener is registered.
     */
    it('Should set width/height and register resize listener', () => {
      const { service, fakeWindow } = setup({ innerWidth: 800, innerHeight: 600 });

      expect(service.width()).toBe(800);
      expect(service.height).toBe(600);

      expect(fakeWindow.addEventListener).toHaveBeenCalled();
      expect(fakeWindow.addEventListener.calls.mostRecent().args[0]).toBe('resize');
      expect(typeof fakeWindow.addEventListener.calls.mostRecent().args[1]).toBe(
        'function'
      );
    });

    /**
     * Ensures that saved theme values from localStorage override computed styles.
     */
    it('Should initialize theme values from localStorage when available', () => {
      const { service } = setup({
        computedPrimary: '#aaa',
        computedAccent: '#bbb',
        computedBackground: 'oklch(0.9 0 0)',
        savedPrimary: '#p',
        savedAccent: '#a',
        savedScheme: 'dark',
      });

      expect(service.primaryColor).toBe('#p');
      expect(service.accentColor).toBe('#a');
      expect(service.mode).toBe('dark');
    });

    /**
     * Ensures that mode is inferred as dark when background lightness < 0.8 and scheme is not saved.
     */
    it('Should infer dark mode from background when scheme is not saved', () => {
      const { service } = setup({
        savedScheme: null,
        computedBackground: 'oklch(0.75 0.1 120)',
      });

      expect(service.mode).toBe('dark');
    });

    /**
     * Ensures that mode is inferred as light when background lightness >= 0.8 and scheme is not saved.
     */
    it('Should infer light mode from background when scheme is not saved', () => {
      const { service } = setup({
        savedScheme: null,
        computedBackground: 'oklch(0.85 0.1 120)',
      });

      expect(service.mode).toBe('light');
    });
  });

  /**
   * Tests for getter signals.
   */
  describe('Getters:', () => {
    /**
     * Ensures that `modeSignal` exposes the current mode value
     * and reacts to mode changes.
     */
    it('[modeSignal] should reflect mode changes', async () => {
      const { service } = setup({
        computedBackground: 'oklch(0.9 0 0)', // -> light (fallback)
        savedScheme: null,
      });

      await flushEffects();

      expect(service.modeSignal()).toBe('light');

      service.mode = 'dark';

      await flushEffects();

      expect(service.modeSignal()).toBe('dark');
    });
  });

  describe('Effects:', () => {
    /**
     * Ensures that primary/accent/mode are synced into CSS variables and localStorage.
     */
    it('Should sync primary, accent and mode to CSS variables and localStorage', async () => {
      const { service, setItemSpy, setPropertySpy } = setup({
        computedPrimary: '#abc',
        computedAccent: '#def',
        computedBackground: 'oklch(0.9 0 0)', // -> light
        savedPrimary: null,
        savedAccent: null,
        savedScheme: null,
      });

      // Flush initial effects created in constructor.
      await flushEffects();

      expect(service.primaryColor).toBe('#abc');
      expect(service.accentColor).toBe('#def');
      expect(service.mode).toBe('light');

      expect(setPropertySpy).toHaveBeenCalledWith('--theme-primary', '#abc');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-accent', '#def');
      expect(setPropertySpy).toHaveBeenCalledWith('color-scheme', 'light');

      expect(setItemSpy).toHaveBeenCalledWith('--theme-primary', '#abc');
      expect(setItemSpy).toHaveBeenCalledWith('--theme-accent', '#def');
      expect(setItemSpy).toHaveBeenCalledWith('color-scheme', 'light');

      // Update signals -> effects should sync again.
      service.primaryColor = '#111';
      service.accentColor = '#222';
      service.mode = 'dark';

      await flushEffects();

      expect(setPropertySpy).toHaveBeenCalledWith('--theme-primary', '#111');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-accent', '#222');
      expect(setPropertySpy).toHaveBeenCalledWith('color-scheme', 'dark');

      expect(setItemSpy).toHaveBeenCalledWith('--theme-primary', '#111');
      expect(setItemSpy).toHaveBeenCalledWith('--theme-accent', '#222');
      expect(setItemSpy).toHaveBeenCalledWith('color-scheme', 'dark');
    });
  });

  describe('Resize handler:', () => {
    /**
     * Ensures that the registered resize handler updates width/height from defaultView.
     */
    it('Should update width and height on resize', () => {
      const { service, fakeWindow } = setup({ innerWidth: 900, innerHeight: 500 });

      const resizeHandler = fakeWindow.addEventListener.calls.mostRecent().args[1] as
        | (() => void)
        | undefined;

      expect(service.width()).toBe(900);
      expect(service.height).toBe(500);

      fakeWindow.innerWidth = 1200;
      fakeWindow.innerHeight = 800;

      resizeHandler?.();

      expect(service.width()).toBe(1200);
      expect(service.height).toBe(800);
    });
  });
});
