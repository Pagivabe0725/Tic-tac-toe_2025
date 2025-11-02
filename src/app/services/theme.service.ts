/*  
xs   0px     Extra small (mobile)  
sm   640px   Small screen (mobile)  
md   768px   Medium screen (tablet)  
lg   1024px  Large screen (desktop)  
xl   1280px  Extra large desktop  
2xl  1536px  Very large monitor  

*/

import {
  DOCUMENT,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';

/**
 * A fixed list of available responsive breakpoints.
 */

 
export const BRAKE_POINTS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', undefined] as const;

/**
 * Type representing possible responsive breakpoint names.
 */
export type BrakePoint = (typeof BRAKE_POINTS)[number];

/**
 * @service Theme
 *
 * Manages the global visual theme of the application, including:
 * - Color scheme (`light` / `dark`)
 * - Primary and accent colors
 * - Responsive screen size tracking
 *
 * The service uses Angular Signals to provide reactivity and automatically
 * synchronizes visual parameters with both CSS variables and `localStorage`.
 */
@Injectable({
  providedIn: 'root',
})
export class Theme {
  /** Reference to the global `document` object. */
  #document = inject(DOCUMENT);

  /** Reactive signal storing the primary color of the theme. */
  #primaryColor: WritableSignal<string | undefined> = signal(undefined);

  /** Reactive signal storing the accent color of the theme. */
  #accentColor: WritableSignal<string | undefined> = signal(undefined);

  /** Reactive signal tracking the current color scheme (`light` or `dark`). */
  #mode: WritableSignal<'light' | 'dark' | undefined> = signal(undefined);

  /** Reactive signal representing the current responsive width breakpoint. */
  #width: WritableSignal<BrakePoint> = signal(undefined);

  /** Reactive signal storing the current viewport height (in px). */
  #height: WritableSignal<number | undefined> = signal(undefined);

  /**
   * Gets the current responsive breakpoint name (e.g., `'md'`, `'xl'`).
   */
  get width(): BrakePoint {
    return this.#width();
  }

  /**
   * Sets a new responsive breakpoint name.
   *
   * @param newWidth - The breakpoint identifier (one of `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`).
   */
  set width(newWidth: BrakePoint) {
    this.#width.set(newWidth);
  }

  /**
   * Gets the current viewport height in pixels.
   */
  get height(): number | undefined {
    return this.#height();
  }

  /**
   * Sets the current viewport height.
   *
   * @param newHeight - The new viewport height in pixels.
   */
  set height(newHeight: number) {
    this.#height.set(newHeight);
  }

  /**
   * Gets the current color scheme (`light` or `dark`).
   */
  get mode(): 'light' | 'dark' | undefined {
    return this.#mode();
  }

  /**
   * Sets the current color scheme.
   *
   * @param newMode - Either `'light'` or `'dark'`.
   */
  set mode(newMode: 'light' | 'dark' | undefined) {
    this.#mode.set(newMode);
  }

  /**
   * Signal representing the primary color of the theme.
   */
  get primaryColor(): string | undefined {
    return this.#primaryColor();
  }

  /**
   * Setter for the primary color.
   * Updates the `primaryColor` signal with a new value.
   */
  set primaryColor(newColor: string | undefined) {
    this.#primaryColor.set(newColor);
  }

  /**
   * Signal representing the accent color of the theme.
   */
  get accentColor(): string | undefined {
    return this.#accentColor();
  }

  /**
   * Setter for the accent color.
   * Updates the `accentColor` signal with a new value.
   */
  set accentColor(newColor: string | undefined) {
    this.#accentColor.set(newColor);
  }

  /**
   * Creates a new {@link Theme} instance, initializing signals, event listeners,
   * and persistent theme data from both computed styles and local storage.
   *
   * The constructor:
   * - Attaches a resize listener to update responsive breakpoints.
   * - Reads stored theme preferences (colors, mode) from `localStorage`.
   * - Sets up effects to keep CSS variables in sync with reactive signals.
   */
  constructor() {
    this.#document.defaultView?.addEventListener('resize', this.onResize);

    this.setBasicState();

    // Sync primary color with CSS variables and localStorage.
    effect(() => {
      if (this.#primaryColor()) {
        this.#document.body.style.setProperty(
          '--theme-primary',
          this.#primaryColor()!
        );
        localStorage.setItem('--theme-primary', this.#primaryColor()!);
      }
    });

    // Sync accent color with CSS variables and localStorage.
    effect(() => {
      if (this.#accentColor()) {
        this.#document.body.style.setProperty(
          '--theme-accent',
          this.#accentColor()!
        );
        localStorage.setItem('--theme-accent', this.#accentColor()!);
      }
    });

    // Sync color scheme with CSS and localStorage.
    effect(() => {
      if (this.#mode()) {
        this.#document.body.style.setProperty('color-scheme', this.#mode()!);
        localStorage.setItem('color-scheme', this.#mode()!);
      }
    });
  }

  /**
   * Determines the breakpoint name (`xs`–`2xl`) for a given width value.
   *
   * @param size - The viewport width in pixels.
   * @returns The breakpoint identifier as a string.
   * @private
   */
  private getBreakPointName(size: number): string {
    if (size < 640) {
      return 'xs';
    } else if (size < 768) {
      return 'sm';
    } else if (size < 1024) {
      return 'md';
    } else if (size < 1280) {
      return 'lg';
    } else if (size < 1536) {
      return 'xl';
    } else {
      return '2xl';
    }
  }

  /**
   * Extracts the lightness component from an OKLCH color string.
   * Example input: `"oklch(0.75 0.1 120)"`.
   *
   * @param oklch - The OKLCH color string.
   * @returns The numeric lightness value (0–1 range).
   * @private
   */
  private getLigthnesFromOKLCH(oklch: string) {
    return parseFloat(oklch.substring(6, oklch.length - 1).split(' ')[0]);
  }

  /**
   * Window resize handler — logs and updates the current breakpoint.
   *
   * @private
   */
  private onResize = () => {
    console.log(this.getBreakPointName(this.#document.defaultView!.innerWidth));
  };

  /**
   * Initializes the theme's internal state from the DOM and localStorage.
   *
   * - Reads CSS variables (`--theme-primary`, `--theme-accent`)
   * - Determines the color scheme (by checking saved data or background lightness)
   * - Updates reactive signals accordingly
   *
   * @private
   */
  private setBasicState(): void {
    const primary = getComputedStyle(this.#document.body).getPropertyValue(
      '--theme-primary'
    );
    const accent = getComputedStyle(this.#document.body).getPropertyValue(
      '--theme-accent'
    );

    const backgroundColorInOKLCH = getComputedStyle(
      this.#document.body
    ).getPropertyValue('background-color');

    const savedPrimary = localStorage.getItem('--theme-primary');
    const savedAccent = localStorage.getItem('--theme-accent');
    const savedScheme = localStorage.getItem('color-scheme') as
      | 'light'
      | 'dark'
      | undefined;

    this.#primaryColor.set(savedPrimary ?? primary);
    this.#accentColor.set(savedAccent ?? accent);
    console.log(this.getLigthnesFromOKLCH(backgroundColorInOKLCH));
    this.#mode.set(
      savedScheme ??
        (this.getLigthnesFromOKLCH(backgroundColorInOKLCH) < 0.8
          ? 'dark'
          : 'light')
    );

  }
}
